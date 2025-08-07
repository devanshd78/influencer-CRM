"use client";

import React, { Suspense, lazy } from "react";
import BrandMediaKitPage from "./ViewInf";

export default function BrandMediaKit() {
    return (
    <div>
      <Suspense fallback={<div>Loading Influencer Media-Kit</div>}>
        <BrandMediaKitPage/>
      </Suspense>
    </div>
  );
}