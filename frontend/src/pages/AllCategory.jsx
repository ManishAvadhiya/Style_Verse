import React, { useState } from "react";
import { motion } from "framer-motion";
import CategoryPage from "./CategoryPage";
import { Link } from "react-router-dom";

const categories = [
  { id: 1, href: "/shirt", name: "Shirt", imageUrl: "/Shirt3.webp" },
  { id: 2, href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirt2.webp" },
  { id: 8, href: "/Pants", name: "Pants", imageUrl: "/pants2.webp" },
  { id: 5, href: "/jeans", name: "Jeans", imageUrl: "/jeans3.webp" },
  { id: 6, href: "/suits", name: "Suits", imageUrl: "/suits1.webp" },
  { id: 9, href: "/kurtas", name: "Kurtas", imageUrl: "/kurta1.webp" },
  { id: 4, href: "/glasses", name: "Glasses", imageUrl: "/glas2.webp" },
  { id: 3, href: "/shoes", name: "Shoes", imageUrl: "/shoe1.webp" },
  { id: 7, href: "/bags", name: "Bags", imageUrl: "/bag.webp" },
];

const AllCategory = () => {
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const handleOnClick = (id) => {
    setActiveCategoryId(id); 
  };

  return (
    <div className="flex justify-evenly items-center">
      <div className="flex-2 ml-5 mt-4">
        <motion.div
          className="flex flex-col justify-start items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-2xl text-emerald-400">Categories</h1>
          <div className="flex flex-col">
            {categories.map((category) => (
              <Link key={category.id} to={"/category" + category.href}>
                <div 
                  className={`flex justify-start items-center mt-4 hover:scale-[1.2] transition-transform`}
                  onClick={() => handleOnClick(category.id)}
                >
                  <motion.img
                    className="w-8 h-8 rounded-full object-cover ml-0 mr-2 pl-0"
                    src={category.imageUrl}
                    alt={category.name}
                  />
                  <h2 
                    className={`text-xl ${
                      activeCategoryId === category.id 
                        ? "text-yellow-400" 
                        : "text-neutral-300"
                    }`}
                  >
                    {category.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="flex-8 flex-grow">
        <CategoryPage />
      </div>
    </div>
  );
};

export default AllCategory;
