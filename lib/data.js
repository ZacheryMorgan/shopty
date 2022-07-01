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
