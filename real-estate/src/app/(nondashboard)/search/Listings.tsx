import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prismaTypes";
import Card from "@/components/Card";
import React from "react";
//import CardCompact from "@/components/CardCompact";

const Listings = () => {
    const{data:authUser}=useGetAuthUserQuery()
    const[addFavorites]=useAddFavoritePropertyMutation()
    const[removeFavorites]=useRemoveFavoritePropertyMutation()
    const viewMode=useAppSelector((state)=>state.global.viewMode)
    const filters=useAppSelector((state)=>state.global.filters)

    const{data:properties,isLoading,isError}=useGetPropertiesQuery(filters)

    const handleFavoritesToggle=async(propertyId:number)=>{
        if(!authUser) return
        
        const isFavorite=authUser.userInfo.favorites.some((fav:Property)=>fav.id===propertyId)

        if(isFavorite){
            await removeFavorites({
                cognitoId:authUser.cognitoInfo.userId,
                propertyId
            })
        }else{
            await addFavorites({
                cognitoId:authUser.cognitoInfo.userId,
                propertyId
            })
        }

    }

    if(isLoading) return <>Loading...</>
    if(isError || !properties)return <div>Failed to fetch properties</div>

  return (
    <div className='w-full '>
        <h3 className='text-sm px-4 font-bold'>{properties.length}{" "}
            <span className='text-gray-700 font-normal'>Places in {filters.location}</span>
        </h3>
        <div className='flex'>
            <div className='w-full p-4'>
                {properties?.map((property)=>viewMode==="grid"?(
                <Card key={property.id} 
                property={property}
                isFavorite={authUser?.userInfo.favorites.some((fav:Property)=>fav.id===property.id||false)}
                onFavoriteToggle={()=>handleFavoritesToggle(property.id)}
                propertyLink={`/search/${property.id}`}
                />)
                :(<></>))}
            </div>
        </div>
    </div>
  )
}

export default Listings