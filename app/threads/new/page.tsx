import { Suspense } from "react";
import { PageLoading } from "@/components/PageStates";
import { NewThreadView } from "@/components/views/FormViews";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewThreadView />
    </Suspense>
  );
}
