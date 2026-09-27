"use client";

import Container from "@/components/layout/container";

import MouseGlow from "./mouse-glow";
import Background from "./background";
import Heading from "./heading";
import UploadFlow from "./upload-flow";

export default function Hero() {
  return (
    <>
      <Background />
      <MouseGlow />

      <section className="relative min-h-screen overflow-hidden">
        <Container>
          <div className="pt-4 sm:pt-6 lg:pt-8">
            <Heading />
          </div>

          <div className="mx-auto mt-6 w-full max-w-5xl pb-6 sm:mt-8 lg:mt-10">
            <UploadFlow />
          </div>
        </Container>
      </section>
    </>
  );
}