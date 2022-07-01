import { optimizeFonts } from "next.config";

export const getProducts = async (prisma, options) => {
  const data = {
    where: {},
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  };

  if (options.author) {
    data.where.author = {
      id: options.author,
    };
  }

  const products = await prisma.product.findMany(data);

  return products;
};

export const getProduct = async (prisma, id) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
    },
  });

  return product;
};

export const getUser = async (prisma, id) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};
