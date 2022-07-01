import middleware from "middleware/middleware";
import nextConnect from "next-connect";

import prisma from "lib/prisma";
import { getSession } from "next-auth/react";
import { upload } from "lib/upload";

const handler = nextConnect();
handler.use(middleware);

handler.post(async (req, res) => {
  const session = await getSession({ req });

  if (!session) return res.status(401).json({ message: "Not logged in" });
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) return res.status(401).json({ message: "User not found" });

  // find product we are updating
  const product = await prisma.product.findUnique({
    where: {
      id: req.body.id[0],
    },
    include: {
      author: true,
    },
  });

  // check if user is the author of the product
  if (product.author.id !== user.id) {
    return res.status(401).json({ message: "User not owner of product" });
  }

  await prisma.product.update({
    data: {
      title: req.body.title[0],
      description: req.body.description[0],
      free: req.body.free[0] === "true" ? true : false,
      price: req.body.price[0] * 100,
    },
    where: {
      id: product.id,
    },
  });

  let image_url = null;
  let product_url = null;

  // assign uploaded image as image_url
  if (req.files.image) {
    image_url = await upload({
      file: req.files.image[0],
      user_id: user.id,
    });
  }

  // assign uploaded file as product_url
  if (req.files.product) {
    product_url = await upload({
      file: req.files.product[0],
      user_id: user.id,
    });
  }

  // Create data variable, this time it might not have a product url if it didn't get updated
  const data = {};

  // if there is an image then assign it to data variable
  if (image_url) {
    data.image = image_url;
  }

  // if there is an product url then assign it to data variable AKA if you updated the product to a new link
  if (product_url) {
    data.url = product_url;
  }

  // Update the product we created earlier with the product url and image url
  await prisma.product.update({
    where: {
      id: product.id,
    },
    data,
  });

  res.end();
  return;
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
