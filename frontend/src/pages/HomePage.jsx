import React, { useEffect } from 'react'
import { useUserStore } from '../stores/useUserStore'
import CategoryItem from '../components/CategoryItem';
import FeaturedProducts from '../components/FeaturedProducts';
import { useProductStore } from '../stores/useProductStore';


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
const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
				Step Into Style 
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
				Discover the latest trends, timeless classics, and everything in between. 
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;