import React, { useEffect, useState } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router-dom'
import foodImg from '../assets/foodRecipe.png'
import { BsStopwatchFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from 'axios';

export default function RecipeItems() {
    const recipes = useLoaderData()
    const [allRecipes, setAllRecipes] = useState()
    let path = window.location.pathname === "/myRecipe" ? true : false
    let favItems = JSON.parse(localStorage.getItem("fav")) ?? []
    const [isFavRecipe, setIsFavRecipe] = useState(false)
    const navigate=useNavigate()
    // console.log(allRecipes) // Content of allRecipes would be useful here to add more info

    useEffect(() => {
        setAllRecipes(recipes)
    }, [recipes])

    const onDelete = async (id) => {
        await axios.delete(`https://foodapp-7hu3.onrender.com/recipe/${id}`)
            .then((res) => console.log(res))
        setAllRecipes(recipes => recipes.filter(recipe => recipe._id !== id))
        let filterItem = favItems.filter(recipe => recipe._id !== id)
        localStorage.setItem("fav", JSON.stringify(filterItem))
    }

    const favRecipe = (item) => {
        let filterItem = favItems.filter(recipe => recipe._id !== item._id)
        favItems = favItems.filter(recipe => recipe._id === item._id).length === 0 ? [...favItems, item] : filterItem
        localStorage.setItem("fav", JSON.stringify(favItems))
        setIsFavRecipe(pre => !pre)
    }

    // Helper function to truncate text
    const truncateText = (text, maxLength) => {
        if (text && text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };

    return (
        <>
            <div className='card-container'>
                {
                    allRecipes?.map((item, index) => {
                        return (
                            <div key={index} className='card' onClick={()=>navigate(`/recipe/${item._id}`)}>
                                {item.coverImage ?
                                    <img src={item.coverImage} width="250px" height="200px" alt={item.title} style={{ objectFit: 'cover' }} /> :
                                    <img src={foodImg} width="250px" height="200px" alt="Default recipe image" style={{ objectFit: 'cover' }} />
                                }
                                <div className='card-body'>
                                    <div className='card-title'>{item.title}</div>
                                    {/* Assuming item.instructions might be available for a short description */}
                                    {item.instructions && (
                                        <p className='card-description'>
                                            {truncateText(item.instructions, 60)}
                                        </p>
                                    )}
                                    <div className='icons'>
                                        <div className='timer'><BsStopwatchFill />{item.time}</div>
                                        {(!path) ? <FaHeart onClick={(e) => { e.stopPropagation(); favRecipe(item); }}
                                            style={{ color: (favItems.some(res => res._id === item._id)) ? "red" : "" }} /> :
                                            <div className='action'>
                                                <Link to={`/editRecipe/${item._id}`} onClick={(e) => e.stopPropagation()} className="editIcon"><FaEdit /></Link>
                                                <MdDelete onClick={(e) => { e.stopPropagation(); onDelete(item._id);}} className='deleteIcon' />
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}
