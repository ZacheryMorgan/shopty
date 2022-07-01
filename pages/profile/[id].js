import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "components/Header";
import Link from "next/link";
import { getProducts, getUser } from "lib/data";
import prisma from "lib/prisma";

const Dashboard = ({ products, user }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  if (isLoading) return null;

  if (!session) router.push("/");
  if (session && !session.user.name) router.push("/setup");

  return (
    <div>
      <Header />
      <h1 className="mt-20 flex justify-center text-xl">
        Products made by {user.name}
      </h1>

      <div className="mt-10 flex justify-center">
        <div className="flex w-full flex-col ">
          {products &&
            products.map((product, index) => (
              <div
                className="mx-auto my-2 flex w-full justify-between border px-4 py-5 md:w-2/3 xl:w-1/3 "
                key={index}
              >
                {product.image && (
                  <img
                    src={product.image}
                    className="h-full w-32 flex-initial"
                  />
                )}
                <div className="ml-3 flex-1">
                  <p>{product.title}</p>
                  {product.free ? (
                    <span className="bg-white px-1 font-bold uppercase text-black">
                      free
                    </span>
                  ) : (
                    <p>${product.price / 100}</p>
                  )}
                </div>
                <div className="">
                  <Link href={`/product/${product.id}`}>
                    <a className="ml-2 border p-2 text-sm font-bold uppercase">
                      View
                    </a>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(context) {
  let user = await getUser(prisma, context.params.id);
  user = JSON.parse(JSON.stringify(user));

  let products = await getProducts(prisma, { author: user.id });
  products = JSON.parse(JSON.stringify(products));

  return {
    props: {
      products,
      user,
    },
  };
}
