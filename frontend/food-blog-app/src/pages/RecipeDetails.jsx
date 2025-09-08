import profileImg from '../assets/profile.png'
import food from '../assets/foodRecipe.png'
import { useLoaderData } from 'react-router-dom'

export default function RecipeDetails() {
    const recipe = useLoaderData() || {}
    const ingredients = recipe.ingredients || []

    return (
        <>
            <div className='outer-container'>
                <div className='profile'>
                    <img src={profileImg} width="50px" height="50px" alt="Author profile" />
                    <h5>{recipe.email || 'Unknown author'}</h5>
                </div>
                <h3 className='title'>{recipe.title}</h3>
                {recipe.coverImage ? (
                    <img src={recipe.coverImage} width="220px" height="200px" alt={recipe.title} />
                ) : (
                    <img src={food} width="220px" height="200px" alt="Default recipe" />
                )}
                <div className='recipe-details'>
                    <div className='ingredients'>
                        <h4>Ingredients</h4>
                        <ul>
                            {ingredients.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className='instructions'>
                        <h4>Instructions</h4>
                        <p>{recipe.instructions || 'No instructions provided.'}</p>
                    </div>
                </div>
            </div>
        </>
    )
}
