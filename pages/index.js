import Header from "components/Header";
import { getProducts } from "lib/data";
import { prisma } from "lib/prisma.ts";
import Link from "next/link";

export default function Home({ products }) {
  // console.log(products);
  return (
    <div>
      <Header />
      <h1 className="mt-20 flex justify-center text-xl">
        Explore the most popular products
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
                <div className="flex flex-col">
                  <div className="">
                    <Link href={`/product/${product.id}`}>
                      <a className="ml-2 border p-2 text-sm font-bold uppercase">
                        View
                      </a>
                    </Link>
                  </div>
                  {product.purchases && product.purchases.length > 0 && (
                    <p className="mt-3 ml-2 text-center">
                      {product.purchases.length}{" "}
                      {product.purchases.length === 1 ? "sale" : "sales"}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  let products = await getProducts(prisma, { take: 3, includePurchases: true });
  products = JSON.parse(JSON.stringify(products));

  products.sort((a, b) => b.purchases.length - a.purchases.length);

  return {
    props: {
      products,
    },
  };
}
