import Header from "components/Header";
import { getProduct } from "lib/data";
import { prisma } from "lib/prisma.ts";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const Product = ({ product }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [free, setFree] = useState(false);
  const [price, setPrice] = useState(product.price / 100);
  const [image, setImage] = useState(null);
  // used to display image on screen
  const [imageUrl, setImageUrl] = useState(product.image);
  const [newProduct, setNewProduct] = useState(null);
  // if link is changed, disables button to view item because it isn't uploaded yet
  const [changedLink, setChangedLink] = useState(false);

  if (isLoading) return null;

  if (!session) router.push("/");
  if (session && !session.user.name) router.push("/setup");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    // to find the product in prisma.product.findUnique
    body.append("id", product.id);
    body.append("title", title);
    body.append("description", description);
    body.append("free", free);
    body.append("price", price);
    body.append("image", image);
    body.append("product", newProduct);

    await fetch("/api/edit", {
      body,
      method: "POST",
    });
    router.push("/dashboard");
  };

  return (
    <div>
      <Header />

      <div className="flex justify-center">
        <form className="mt-10" onSubmit={handleSubmit}>
          <div className="mb-5 flex-1">
            <div className="mb-2 flex-1">Product title (required)</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 border p-1 text-black"
              required
            />
            <div className="relative mt-2 mb-3 flex items-start">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  checked={free}
                  onChange={(e) => setFree(!free)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label>Check if the product is free</label>
              </div>
            </div>
            {!free && (
              <>
                <div className="mb-2 flex-1">Product price in $ (required)</div>
                <input
                  value={price}
                  pattern="^\d*(\.\d{0,2})?$"
                  onChange={(e) => setPrice(e.target.value)}
                  className="mb-4 border p-1 text-black"
                  required
                />
              </>
            )}
            <div className="mb-2 flex-1">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-1 text-black "
            />
          </div>

          <div className="text-sm text-gray-600 ">
            <label className="relative my-3 block  cursor-pointer font-medium">
              <p className="">Product image {image && "✅"}</p> (800 x 450
              suggested)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files && event.target.files[0]) {
                    if (event.target.files[0].size > 3072000) {
                      alert("Maximum size allowed is 3MB");
                      return false;
                    }
                    setImage(event.target.files[0]);
                    setImageUrl(URL.createObjectURL(event.target.files[0]));
                  }
                }}
              />
            </label>
            <img src={imageUrl} className="h-full w-32" />
          </div>

          <div className="text-sm text-gray-600 ">
            <label className="relative my-3 block  cursor-pointer font-medium">
              <p className="">Product {product && "changed ✅"}</p>
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files && event.target.files[0]) {
                    if (event.target.files[0].size > 20480000) {
                      alert("Maximum size allowed is 20MB");
                      return false;
                    }
                    setNewProduct(event.target.files[0]);
                    setChangedLink(true);
                  }
                }}
              />
            </label>
            {!changedLink && (
              <a className="underline" href={product.url}>
                Link
              </a>
            )}
          </div>
          <button
            disabled={title && (free || price) ? false : true}
            className={`mt-10 border px-8 py-2 font-bold  ${
              title && (free || price)
                ? ""
                : "cursor-not-allowed border-gray-800 text-gray-800"
            }`}
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Product;

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) return { props: {} };

  let product = await getProduct(prisma, context.params.id);
  product = JSON.parse(JSON.stringify(product));

  if (!product) return { props: {} };

  if (product.author.id !== session.user.id) return { props: {} };

  return {
    props: {
      product,
    },
  };
}
