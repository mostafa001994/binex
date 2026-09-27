import { randomInt } from "node:crypto";

import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_SECONDS,
  OTP_TTL_SECONDS,
  SESSION_TTL_DAYS,
  getOtpDriver,
} from "@/server/auth/auth-config";

import {
  createOpaqueToken,
  hashValue,
} from "@/server/auth/auth-crypto";

import {
  getOtpProvider,
} from "@/server/auth/otp-provider";

import type {
  OtpChallenge,
  RequestOtpResult,
  VerifyOtpResult,
} from "@/server/auth/auth-types";

import {
  getOtpRepository,
  getSessionRepository,
  getUserRepository,
} from "@/server/repositories/repository-provider";

import {
  ForbiddenApiError,
  UnauthorizedApiError,
  ValidationApiError,
} from "@/server/core/api-error";


export {
  AUTH_COOKIE_NAME,
} from "@/server/auth/auth-config";



export async function requestOtp(
  phone:string,
):Promise<RequestOtpResult>{


  const otpRepository =
    getOtpRepository();


  const activeChallenge =
    await otpRepository.findLatestActiveByPhone(phone);


  if(activeChallenge){

    const createdAt =
      new Date(
        activeChallenge.createdAt
      ).getTime();


    const resendAt =
      createdAt +
      OTP_RESEND_SECONDS * 1000;


    if(resendAt > Date.now()){

      const remaining =
        Math.ceil(
          (resendAt - Date.now()) / 1000
        );


      throw new ValidationApiError(
        "برای ارسال مجدد کمی صبر کنید.",
        {
          phone:[
            `ارسال مجدد تا ${remaining} ثانیه دیگر امکان‌پذیر است.`
          ]
        },
      );

    }

  }


  const code =
    String(
      randomInt(
        10000,
        100000
      )
    );


  const now =
    new Date();


  const expiresAt =
    new Date(
      now.getTime()
      +
      OTP_TTL_SECONDS * 1000
    );


  const challenge:OtpChallenge = {

    id:
      crypto.randomUUID(),

    phone,

    codeHash:
      hashValue(code),

    expiresAt:
      expiresAt.toISOString(),

    attempts:0,

    maxAttempts:
      OTP_MAX_ATTEMPTS,

    consumedAt:null,

    createdAt:
      now.toISOString(),

  };


  await otpRepository.create(
    challenge
  );


  try {

    await getOtpProvider()
      .sendCode({
        phone,
        code,
      });

  } catch {

    try {

      await otpRepository.consume(
        challenge.id
      );

    } catch {

      // Prevent delivery failure handling
      // from exposing provider/database details.

    }


    throw new ValidationApiError(
      "ارسال کد تأیید ناموفق بود.",
      {
        phone:[
          "لطفاً دوباره تلاش کنید."
        ]
      },
    );

  }


  return {

    challengeId:
      challenge.id,

    expiresInSeconds:
      OTP_TTL_SECONDS,

    resendAfterSeconds:
      OTP_RESEND_SECONDS,

    ...(getOtpDriver()==="mock"
      &&
      process.env.NODE_ENV !== "production"
      ?
      {
        devCode:code
      }
      :
      {}
    ),

  };

}



export async function verifyOtp(
  phone:string,
  code:string,
):Promise<VerifyOtpResult>{


  const otpRepository =
    getOtpRepository();


  const challenge =
    await otpRepository
    .findLatestActiveByPhone(phone);


  if(!challenge){

    throw new ValidationApiError(
      "کد تأیید منقضی شده یا وجود ندارد.",
      {
        code:[
          "یک کد جدید دریافت کنید."
        ]
      },
    );

  }


  if(
    challenge.attempts
    >=
    challenge.maxAttempts
  ){

    throw new ValidationApiError(
      "تعداد تلاش‌های مجاز تمام شده است.",
      {
        code:[
          "یک کد جدید دریافت کنید."
        ]
      },
    );

  }


  if(
    challenge.codeHash
    !==
    hashValue(code)
  ){

    await otpRepository
      .incrementAttempts(
        challenge.id
      );


    throw new ValidationApiError(
      "کد واردشده صحیح نیست.",
      {
        code:[
          "کد تأیید را دوباره بررسی کنید."
        ]
      },
    );

  }


  await otpRepository
    .consume(
      challenge.id
    );


  const userRepository =
    getUserRepository();


  let user =
    await userRepository
      .findByPhone(phone);


  if(!user){

    user =
      await userRepository
        .create({
          phone
        });

  }


  if(user.status==="blocked"){

    throw new ForbiddenApiError(
      "این حساب مسدود شده است؛ با پشتیبانی تماس بگیرید."
    );

  }


  const sessionToken =
    createOpaqueToken();


  const now =
    new Date();


  const expiresAt =
    new Date(
      now.getTime()
      +
      SESSION_TTL_DAYS
      *
      24
      *
      60
      *
      60
      *
      1000
    );


  await getSessionRepository()
    .create({

      id:
        crypto.randomUUID(),

      tokenHash:
        hashValue(sessionToken),

      userId:
        user.id,

      createdAt:
        now.toISOString(),

      expiresAt:
        expiresAt.toISOString(),

      revokedAt:null,

    });


  return {

    user,

    sessionToken,

    sessionExpiresAt:
      expiresAt.toISOString(),

  };

}



export async function getAuthenticatedUser(
  sessionToken?:string|null
){

  if(!sessionToken){

    throw new UnauthorizedApiError();

  }


  const session =
    await getSessionRepository()
      .findActiveByTokenHash(
        hashValue(sessionToken),
      );


  if(!session){

    throw new UnauthorizedApiError(
      "نشست شما معتبر نیست یا منقضی شده است."
    );

  }


  const user =
    await getUserRepository()
      .findById(
        session.userId
      );


  if(!user){

    throw new UnauthorizedApiError();

  }


  if(user.status==="blocked"){

    throw new UnauthorizedApiError(
      "این حساب مسدود شده است."
    );

  }


  return user;

}



export async function logout(
  sessionToken?:string|null
){

  if(!sessionToken){

    return;

  }


  await getSessionRepository()
    .revokeByTokenHash(
      hashValue(sessionToken)
    );

}



export async function getSessionOverview(
  sessionToken?:string|null
){

  const user =
    await getAuthenticatedUser(
      sessionToken
    );


  const session =
    await getSessionRepository()
      .findActiveByTokenHash(
        hashValue(sessionToken!)
      );


  return {
    user,
    session,
  };

}
