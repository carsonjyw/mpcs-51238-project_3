import { Suspense } from "react";
import { PageLoading } from "@/components/PageStates";
import { NextStepView } from "@/components/views/FormViews";

// The title depends on saved data, so the client view sets it with DocumentTitle.
export default function Page() {
  return (
    <Suspense fallback={<PageLoading label="Loading this map…" />}>
      <NextStepView />
    </Suspense>
  );
}
