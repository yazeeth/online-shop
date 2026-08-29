import prisma from "../config/database";


export const createCategory = async (
    name: string
) => {

    if (!name || !name.trim()) {
        throw new Error("Category name is required");
    }

    const existingCategory = await prisma.category.findUnique({
        where: {
            name: name.trim()
        }
    });

    if (existingCategory) {
        throw new Error("Category already exists");
    }

    const category = await prisma.category.create({
        data: {
            name: name.trim()
        }
    });


    return category;

};



export const getCategories = async () => {

    return await prisma.category.findMany({
        include: {
            products: true
        }
    });

};

export const getCategoryById = async (
    id: number
) => {

    const category = await prisma.category.findUnique({
        where: {
            id
        }
    });

    return category;

};

export const deleteCategory = async (
    id: number
) => {

    const category = await prisma.category.findUnique({
        where: {
            id
        },
        include: {
            products: {
                where: {
                    active: true
                },
                select: {
                    id: true
                }
            }
        }
    });

    if (!category) {
        throw new Error("Category not found");
    }

    if (category.products.length > 0) {
        throw new Error("Cannot delete category because it has active products");
    }

    return await prisma.category.delete({
        where: {
            id
        }
    });
};