import { Request, Response } from "express";

import {
    createCategory,
    getCategories,
    deleteCategory
} from "../services/category.service";



export const addCategory = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            name
        } = req.body;


        const category = await createCategory(
            name
        );


        res.status(201).json({
            message: "Category created successfully",
            category
        });


    } catch(error:any){

        res.status(400).json({
            message: error.message
        });

    }

};

export const getAllCategories = async (
    req: Request,
    res: Response
) => {

    try {

        const categories = await getCategories();


        res.json(categories);


    } catch(error:any){

        res.status(400).json({
            message: error.message
        });

    }

};

export const removeCategory = async (
    req: Request,
    res: Response
) => {

    try {

        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const category = await deleteCategory(id);

        res.json({
            message: "Category deleted successfully",
            category
        });

    } catch(error:any){

        const statusCode = error.message === "Category not found"
            ? 404
            : error.message === "Cannot delete category because it has active products"
                ? 409
                : 400;

        res.status(statusCode).json({
            message: error.message
        });

    }

};