import { Router } from "express";

import {
    addCategory,
    getAllCategories,
    removeCategory
} from "../controllers/category.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";


const router = Router();


/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Mobile phones and electronic devices
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: Electronics
 *               description: Mobile phones and electronic devices
 *       400:
 *         description: Invalid category data
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    authMiddleware,
    requireAdmin,
    addCategory
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", getAllCategories);

router.delete(
    "/:id",
    authMiddleware,
    requireAdmin,
    removeCategory
);


export default router;