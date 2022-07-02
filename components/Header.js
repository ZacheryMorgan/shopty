import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  if (isLoading) return null;

  return (
    <header className="flex h-14 px-5 pt-5 pb-2">
      <div className="text-xl">
        {router.asPath === "/" ? (
          <p>shopty</p>
        ) : (
          <Link href={`/`}>
            <a className="underline">Home</a>
          </Link>
        )}
      </div>

      <div className="ml-10 -mt-1 grow"></div>

      {session &&
        (router.asPath === "/dashboard" ? (
          <>
            <div className="mr-3">
              <Link href={`/dashboard/sales`}>
                <a className="underline">See sales</a>
              </Link>
            </div>
            <div className="mr-3">
              <Link href={`/dashboard/new`}>
                <a className="underline">Create a new product</a>
              </Link>
            </div>
            <p className="mr-3 font-bold">Dashboard</p>
          </>
        ) : (
          <Link href={`/dashboard`}>
            <a className="flex">
              <p className="mr-3 underline">Dashboard</p>
            </a>
          </Link>
        ))}
      <a
        className="flex-l rounded-full border px-4 font-bold"
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
      >
        {session ? "logout" : "login"}
      </a>
    </header>
  );
};

export default Header;
