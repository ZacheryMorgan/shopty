import middleware from "middleware/middleware";
import nextConnect from "next-connect";

import { prisma } from "lib/prisma.ts";
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

  // create the product
  const product = await prisma.product.create({
    data: {
      title: req.body.title[0],
      description: req.body.description[0],
      price: Number(req.body.price[0]) * 100,
      free: req.body.free[0] === "true" ? true : false,
      author: {
        connect: {
          id: user.id,
        },
      },
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

  // Create data variable with product link
  const data = {
    url: product_url,
  };

  // if there is an image then assign it to data variable
  if (image_url) {
    data.image = image_url;
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
