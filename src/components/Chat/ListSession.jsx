import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Avatar from '../Avatar'
import AvatarName from '../AvatarName'
import { SessionType } from '../../lib/MessengerConst'
import TextTimestamp from '../TextTimestamp'

const ListSession = ({ session, textSize = 'text-base' }) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <div className={`${textSize}`}>
      {
        session.type === SessionType.Private &&
        <div className={`flex flex-row mx-5px mt-5px`} onClick={() => {
          dispatch({ type: 'LoadCurrentSession', payload: session })
        }
        }>
          <Avatar address={session.address} timestamp={Date.now()} style={'avatar-sm'} />
          <div className={`flex flex-col justify-between`}>
            <div className={`flex flex-col justify-between px-1`}>
              <AvatarName address={session.address} />
              <TextTimestamp timestamp={session.updated_at} textSize={'text-xs'} />
            </div>
            <div className={`flex flex-row justify-between`}>
              {session.recent_msg}
            </div>
          </div>
        </div>
      }
      {
        session.type === SessionType.Group &&
        <div className={`flex flex-row mx-5px mt-5px`}>
          <Avatar address={session.address} timestamp={Date.now()} style={'avatar-sm'} />
          <div className={`flex flex-col justify-between`}>
            <div className={`flex flex-row justify-between px-1`}>
              <AvatarName address={session.address} />
              <TextTimestamp timestamp={session.updated_at} textSize={'text-xs'} />
            </div>
            <div className={`flex flex-row justify-between`}>
              {session.recent_msg}
            </div>
          </div>
        </div>
      }
      {
        session.type === SessionType.Channel &&
        <div className={`flex flex-row mx-5px mt-5px`}>
          <Avatar address={session.address} timestamp={Date.now()} style={'avatar-sm'} />
          <div className={`flex flex-col justify-between`}>
            <div className={`flex flex-row justify-between px-1`}>
              <AvatarName address={session.address} />
              <TextTimestamp timestamp={session.updated_at} textSize={'text-xs'} />
            </div>
            <div className={`flex flex-row justify-between`}>
              {session.recent_msg}
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default ListSession