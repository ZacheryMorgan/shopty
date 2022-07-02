import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "components/Header";
import Link from "next/link";
import { getProducts, getPurchases } from "lib/data";
import prisma from "lib/prisma";

const Dashboard = ({ products, purchases }) => {
  console.log(products);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  if (isLoading) return null;

  if (!session) router.push("/");
  if (session && !session.user.name) router.push("/setup");

  return (
    <div>
      <Header />
      <h1 className="mt-20 flex justify-center text-xl">Dashboard</h1>

      <div className="mt-10 flex justify-center">
        {products.length > 0 && (
          <div className="flex w-full flex-col ">
            <h2 className="mb-4 text-center text-xl">Products</h2>

            {products.map((product, index) => (
              <div
                className="mx-auto my-2 flex w-full justify-between border px-4 py-5 md:w-2/3 "
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
                  <div className="">
                    <Link href={`/dashboard/product/${product.id}`}>
                      <a className="border p-2 text-sm font-bold uppercase">
                        Edit
                      </a>
                    </Link>
                    <Link href={`/product/${product.id}`}>
                      <a className="ml-2 border p-2 text-sm font-bold uppercase">
                        View
                      </a>
                    </Link>
                  </div>
                  {product.purchases && product.purchases.length > 0 && (
                    <p className="mt-3 text-right">
                      {product.purchases.length}{" "}
                      {product.purchases.length === 1 ? "sale" : "sales"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {purchases.length > 0 && (
          <div className="flex w-full flex-col">
            <h2 className="mb-4 text-center text-xl">Purchases</h2>
            {purchases.map((purchase, index) => (
              <div
                className="mx-auto my-2 flex w-full justify-between border px-4 py-5 md:w-2/3 "
                key={index}
              >
                {purchase.product.image && (
                  <img
                    src={purchase.product.image}
                    className="h-14 w-14 flex-initial"
                  />
                )}
                <div className="ml-3 flex-1">
                  <p>{purchase.product.title}</p>
                  {parseInt(purchase.amount) === 0 ? (
                    <span className="bg-white px-1 font-bold uppercase text-black">
                      free
                    </span>
                  ) : (
                    <p>${purchase.amount / 100}</p>
                  )}
                </div>
                <div className="">
                  <a
                    href={purchase.product.url}
                    className="border p-2 text-sm font-bold uppercase"
                  >
                    Get files
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(context) {
  // fetch current user session so we only show that user's products in the dashboard
  const session = await getSession(context);

  if (!session) return { props: {} };

  let products = await getProducts(prisma, {
    author: session.user.id,
    includePurchases: true,
  });
  products = JSON.parse(JSON.stringify(products));

  let purchases = await getPurchases(prisma, { author: session.user.id });
  purchases = JSON.parse(JSON.stringify(purchases));

  return {
    props: {
      products,
      purchases,
    },
  };
}
