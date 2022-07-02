import Header from "components/Header";
import { alreadyPurchased, getProduct } from "lib/data";
import Link from "next/link";
import prisma from "lib/prisma";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";

const Product = ({ product, purchased }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  if (!product) return null;
  if (isLoading) return null;

  const handleClick = async (e) => {
    if (product.free) {
      await fetch("/api/download", {
        body: JSON.stringify({
          product_id: product.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      router.push("/dashboard");
    } else {
      const res = await fetch("/api/stripe/session", {
        body: JSON.stringify({
          amount: product.price,
          title: product.title,
          product_id: product.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = await res.json();

      if (data.status === "error") {
        alert(data.message);
        return;
      }

      const sessionId = data.sessionId;
      const stripePublicKey = data.stripePublicKey;

      const stripe = Stripe(stripePublicKey);
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });
    }
  };

  return (
    <div>
      <Head>
        <title>Digital Downloads</title>
        <meta name="description" content="Digital Downloads Website" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://js.stripe.com/v3/" async></script>
      </Head>
      <Header />
      <div className="flex justify-center">
        <div className="mx-auto mt-10 flex w-full flex-col border px-10 md:w-2/3 xl:w-1/3">
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
              {!session && <p>Login first</p>}
              {session && (
                <>
                  {purchased ? (
                    "Already purchased"
                  ) : (
                    <>
                      {session.user.id !== product.author.id ? (
                        <button
                          onClick={handleClick}
                          className="border p-2 text-sm font-bold uppercase"
                        >
                          {product.free ? "DOWNLOAD" : "PURCHASE"}
                        </button>
                      ) : (
                        "Your product"
                      )}
                    </>
                  )}
                </>
              )}
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
  const session = await getSession(context);
  let product = await getProduct(prisma, context.params.id);
  product = JSON.parse(JSON.stringify(product));

  let purchased = null;
  if (session) {
    purchased = await alreadyPurchased(prisma, {
      product: product.id,
      author: session.user.id,
    });
  }

  return {
    props: {
      product,
      purchased,
    },
  };
}
