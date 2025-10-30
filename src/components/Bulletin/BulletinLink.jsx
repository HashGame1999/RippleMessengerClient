import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createSearchParams, useNavigate } from 'react-router-dom'
import AvatarName from '../AvatarName'
import { AiOutlineLink } from "react-icons/ai"

const BulletinLink = ({ address, sequence, hash, sour_address }) => {

  const navigate = useNavigate()
  const goto_bulletin = () => {
    const params = { hash: hash, address: address, sequence: sequence, sour_address: sour_address };
    navigate({
      pathname: '/bulletin_view',
      search: `?${createSearchParams(params)}`
    })
  }

  return (
    <div className='flex flex-row justify-start bulletin-link' title={hash} onClick={() => {
      console.log("导航被触发，目标路径：/target")
      goto_bulletin()
    }}>
      <AiOutlineLink className="icon-sm" />
      <AvatarName address={address} />#{sequence}
    </div>
  )
}

export default BulletinLink