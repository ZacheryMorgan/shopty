import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";

import prisma from "lib/prisma";
import { getSales } from "lib/data";

import Header from "components/Header";

const Sales = ({ sales }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const loading = status === "loading";

  if (loading) {
    return null;
  }

  if (!session) {
    router.push("/");
  }

  if (session && !session.user.name) {
    router.push("/setup");
  }

  return (
    <div>
      <Header />

      <h1 className="mt-20 mb-10 flex justify-center text-xl">Sales</h1>
      <h3 className="mt-20 mb-10 flex justify-center text-xl">
        Total earned $
        {sales.reduce((accumulator, sale) => {
          return accumulator + parseFloat(sale.amount);
        }, 0) / 100}
      </h3>

      {sales.length > 0 && (
        <div className="flex w-full flex-col">
          {sales.map((sale, index) => (
            <div
              className="mx-auto my-2 flex w-full justify-between border px-4 py-5 md:w-2/3 xl:w-1/3 "
              key={index}
            >
              {sale.product.image && (
                <img
                  src={sale.product.image}
                  className="h-full w-32 flex-initial"
                />
              )}
              <div className="ml-3 flex-1">
                <p>{sale.product.title}</p>
                {parseInt(sale.amount) === 0 ? (
                  <span className="bg-white px-1 font-bold uppercase text-black">
                    free
                  </span>
                ) : (
                  <p>${sale.amount / 100}</p>
                )}
              </div>
              <div className="">
                <p className="p-2 text-sm font-bold">
                  {sale.author.name}
                  <br />
                  {sale.author.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sales;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  let sales = await getSales(prisma, { author: session.user.id });
  sales = JSON.parse(JSON.stringify(sales));

  return {
    props: {
      sales,
    },
  };
}
