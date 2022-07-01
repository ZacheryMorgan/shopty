import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "components/Header";

const NewProduct = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState(0);
  const [free, setFree] = useState(false);

  if (isLoading) return null;

  if (!session) router.push("/");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    body.append("title", title);
    body.append("description", description);
    body.append("image", image);
    body.append("product", product);
    body.append("price", price);
    body.append("free", free);

    await fetch("/api/new", {
      body,
      method: "POST",
    });

    router.push("/dashboard");
  };

  return (
    <div>
      <Header />
      <h1 className="mt-20 flex justify-center text-xl">Add a new product</h1>
      <div className="flex justify-center">
        <form className="mt-10" onSubmit={handleSubmit}>
          <div className="mb-5 flex-1">
            <div className="mb-2 flex-1">Product title (required)</div>
            <input
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
                  pattern="^\d*(\.\d{0,2})?$"
                  onChange={(e) => setPrice(e.target.value)}
                  className="mb-4 border p-1 text-black"
                  required
                />
              </>
            )}
            <div className="mb-2 flex-1">Description</div>
            <textarea
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
                  }
                }}
              />
            </label>
          </div>
          <div className="text-sm text-gray-600 ">
            <label className="relative my-3 block  cursor-pointer font-medium">
              <p className="">Product {product && "✅"}</p> (required)
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files && event.target.files[0]) {
                    if (event.target.files[0].size > 20480000) {
                      alert("Maximum size allowed is 20MB");
                      return false;
                    }
                    setProduct(event.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
          <button
            disabled={title && product && (free || price) ? false : true}
            className={`mt-10 border px-8 py-2 font-bold  ${
              title && (free || price)
                ? "cursor-pointer"
                : "cursor-not-allowed border-gray-800 text-gray-800"
            }`}
          >
            Create product
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
