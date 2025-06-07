const Recipes = require("../models/recipe");
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary config

// Change multer storage to memoryStorage
const upload = multer({ storage: multer.memoryStorage() });

const getRecipes = async (req, res) => {
    const recipes=await Recipes.find()
    return res.json(recipes)
}

const getRecipe=async(req,res)=>{
    const recipe=await Recipes.findById(req.params.id)
    res.json(recipe)
}

const addRecipe=async(req,res)=>{
    console.log(req.user)
    const { title, ingredients, instructions, time } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ message: "Required fields can't be empty" }); // Use 400 for bad request
    }

    try {
        let imageUrl = '';
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto', folder: 'food-blog-app' }, // Optional: specify folder in Cloudinary
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        } else {
            // Optional: set a default image URL or handle as an error if image is required
        }

        const newRecipe = await Recipes.create({
            title,
            ingredients,
            instructions,
            time,
            coverImage: imageUrl, // Save Cloudinary URL
            createdBy: req.user.id,
        });
        return res.status(201).json(newRecipe); // Use 201 for resource created
    } catch (error) {
        console.error("Error creating recipe or uploading to Cloudinary:", error);
        return res.status(500).json({ message: "Error creating recipe", error: error.message });
    }
};

const editRecipe = async (req, res) => {
    // const { title, ingredients, instructions, time } = req.body; // req.body can be spread directly
    let recipe = await Recipes.findById(req.params.id);

    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }

    // Optional: Check if the user is authorized to edit this recipe
    // if (recipe.createdBy.toString() !== req.user.id) {
    //     return res.status(403).json({ message: "User not authorized to edit this recipe" });
    // }

    try {
        let imageUrl = recipe.coverImage; // Keep old image by default

        if (req.file) {
            // Optional: Delete old image from Cloudinary if it exists
            // if (recipe.coverImage && recipe.coverImage.includes('cloudinary')) { // Check if current image is from Cloudinary
            //     const publicId = recipe.coverImage.split('/').pop().split('.')[0];
            //     try {
            //         await cloudinary.uploader.destroy(`food-blog-app/${publicId}`); // Ensure folder is included if used during upload
            //     } catch (deleteError) {
            //         console.error("Error deleting old image from Cloudinary:", deleteError);
            //     }
            // }

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto', folder: 'food-blog-app' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }

        const updatedRecipeData = {
            ...req.body,
            coverImage: imageUrl,
        };

        // Remove fields that shouldn't be directly updated from req.body if necessary
        delete updatedRecipeData.createdBy; // User should not be able to change createdBy

        const updatedRecipe = await Recipes.findByIdAndUpdate(
            req.params.id,
            updatedRecipeData,
            { new: true }
        );
        return res.json(updatedRecipe);
    } catch (error) {
        console.error("Error updating recipe or uploading to Cloudinary:", error);
        return res.status(500).json({ message: "Error updating recipe", error: error.message });
    }
};

const deleteRecipe = async (req, res) => {
// Optional: Before deleting the recipe from DB, delete its image from Cloudinary
    // try {
    //     const recipeToDelete = await Recipes.findById(req.params.id);
    //     if (recipeToDelete && recipeToDelete.coverImage && recipeToDelete.coverImage.includes('cloudinary')) {
    //         const publicId = recipeToDelete.coverImage.split('/').pop().split('.')[0];
    //         await cloudinary.uploader.destroy(`food-blog-app/${publicId}`);
    //     }
    // } catch (cloudinaryError) {
    //     console.error("Error deleting image from Cloudinary during recipe deletion:", cloudinaryError);
    //     // Decide if you want to proceed with DB deletion even if Cloudinary deletion fails
    // }

    try{
        await Recipes.deleteOne({_id:req.params.id})
        res.json({status:"ok"})
    }
    catch(err){
        return res.status(400).json({message:"error"})
    }
}

module.exports={getRecipes,getRecipe,addRecipe,editRecipe,deleteRecipe,upload}