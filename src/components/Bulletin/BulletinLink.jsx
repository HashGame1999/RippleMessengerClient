import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AvatarName from '../AvatarName'
import { AiOutlineLink } from "react-icons/ai"

const BulletinLink = ({ address, sequence, hash }) => {

  const navigate = useNavigate()

  return (
    <div className='flex flex-row justify-start bulletin-link' title={hash} onClick={() => {
      console.log("导航被触发，目标路径：/target")
      navigate(`/bulletin_view/${hash}`)
    }}>
      <AiOutlineLink className="icon-sm" />
      <AvatarName address={address} />#{sequence}
    </div>
  )
}

export default BulletinLink