import React, { useEffect } from "react";
import { Provider as SessionProvider } from "next-auth/client";
import { PageContextProvider } from "./usePageContext";
import type { PageContext } from "./types";
import { Link } from "./Link";
import { Session } from "next-auth";
import ReactGA from "react-ga";

ReactGA.initialize(process.env.GOOGLE_ANALYTICS_TRACKING_ID as string);

export { PageShell };

function PageShell({
  pageContext,
  children,
}: {
  pageContext: PageContext & { session: Session | null };
  children: React.ReactNode;
}) {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);
  return (
    <React.StrictMode>
      <SessionProvider session={pageContext.session || undefined}>
        <PageContextProvider pageContext={pageContext}>
          <Link href="/">
            <button>Home</button>
          </Link>
          <Link href="/auth">
            <button>Auth</button>
          </Link>

          {children}
        </PageContextProvider>
      </SessionProvider>
    </React.StrictMode>
  );
}
