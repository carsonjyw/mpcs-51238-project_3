import { Suspense } from "react";
import { PageLoading } from "@/components/PageStates";
import { ThreadPageView } from "@/components/views/ThreadPageView";

// The title depends on saved data, so the client view renders it with <title>.
export default function Page() {
  return (
    <Suspense fallback={<PageLoading label="Loading this thread…" />}>
      <ThreadPageView />
    </Suspense>
  );
}
