import Header from "components/Header";
import { getProduct } from "lib/data";
import Link from "next/link";
import prisma from "lib/prisma";

const Product = ({ product }) => {
  if (!product) return null;

  return (
    <div>
      <Header />
      <div className="flex justify-center">
        <div className="mx-auto mt-10 flex w-full flex-col border px-4 px-10 md:w-2/3 xl:w-1/3">
          <div className="flex justify-between py-10">
            {product.image && (
              <img src={product.image} className="h-full w-32 flex-initial" />
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
              <button className="border p-2 text-sm font-bold uppercase">
                PURCHASE
              </button>
            </div>
          </div>
          <div className="mb-10">{product.description}</div>
          <div className="mb-10">
            Created by
            <Link href={`/profile/${product.author.id}`}>
              <a className="ml-1 font-bold underline">{product.author.name}</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;

export async function getServerSideProps(context) {
  let product = await getProduct(prisma, context.params.id);
  product = JSON.parse(JSON.stringify(product));

  return {
    props: {
      product,
    },
  };
}
