import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { BulletinPreviewSize } from '../../lib/MessengerConst'
import BulletinContent from './BulletinContent'
import Avatar from '../Avatar'
import { setFlashNoticeMessage } from '../../store/slices/UserSlice'
import BulletinLink from './BulletinLink'

import { IoStarOutline, IoCopyOutline, IoArrowRedoOutline, IoInformationCircleOutline, IoPersonAddOutline, IoAttachSharp } from "react-icons/io5"
import { RiUserAddLine } from "react-icons/ri"
import { MdOutlinePersonAddAlt } from "react-icons/md"
import { GoLink, GoLinkExternal } from "react-icons/go"
import { AiOutlineLink } from "react-icons/ai"
import { MdPostAdd } from "react-icons/md"
import BulletinTools from './BulletinTools'
import TextTimestamp from '../TextTimestamp'

const ListBulletin = ({ bulletin, textSize = 'text-base' }) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <div className={`${textSize}`}>
      <div className={`flex flex-row mx-5px mt-5px`}>
        <Avatar address={bulletin.Address} timestamp={Date.now()} style={'avatar-sm'} />
        <div className={`flex flex-col`}>

          <div className={`flex flex-row justify-between`}>
            <BulletinLink address={bulletin.Address} sequence={bulletin.Sequence} hash={bulletin.Hash} />
            <TextTimestamp timestamp={bulletin.SignedAt} textSize={'text-xs'} />
            {
              bulletin.Quote.length !== 0 &&
              <div className={`text-base flex flex-row items-center font-bold text-gray-400 dark:text-gray-200`}>
                <AiOutlineLink />{bulletin.Quote.length}
              </div>
            }
            {
              bulletin.File.length !== 0 &&
              <div className={`text-base flex flex-row items-center font-bold text-gray-400 dark:text-gray-200`}>
                <IoAttachSharp />{bulletin.File.length}
              </div>
            }
          </div>
          <BulletinTools address={bulletin.Address} sequence={bulletin.Sequence} hash={bulletin.Hash} json={bulletin.Json} content={bulletin.Content} />
        </div>
      </div>

      {bulletin.Content.length <= BulletinPreviewSize ?
        <BulletinContent content={bulletin.Content} onClick={() => navigate(`/bulletin_view/${bulletin.Hash}`)} />
        :
        <BulletinContent content={bulletin.Content.slice(0, BulletinPreviewSize)} onClick={() => navigate(`/bulletin_view/${bulletin.Hash}`)} />
      }
    </div>
  )
}

export default ListBulletin