import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { BulletinPageTab } from '../lib/AppConst'
import { setActiveTabBulletin } from '../store/slices/MessengerSlice'
import TabFollow from './bulletin/TabFollow'
import TabMine from './bulletin/TabMine'
import TabRandom from './bulletin/TabRandom'
import BulletinPublish from '../components/Bulletin/BulletinPublish'

export default function BulletinPage() {
  const tabItems = [
    { name: BulletinPageTab.Follow, content: <TabFollow /> },
    { name: BulletinPageTab.Mine, content: <TabMine /> },
    { name: BulletinPageTab.Random, content: <TabRandom /> },
  ]

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { ShowPublishFlag, activeTabBulletin } = useSelector(state => state.Messenger)

  return (
    <div className="p-1 mt-8">
      <div className="flex justify-center items-center">
        {
          ShowPublishFlag &&
          <BulletinPublish />
        }
        <div className="w-full overflow-y-auto text-gray-800 dark:text-gray-200 transition-width duration-300 ease-in-out pb-20"
        >
          <div className="flex border-b">
            {tabItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => dispatch(setActiveTabBulletin(item.name))}
                className={`px-6 py-3 ${activeTabBulletin === item.name ?
                  'tab-title-active'
                  :
                  'tab-title'
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="p-4">
            {tabItems.map((item, index) => (
              <div
                key={item.name}
                className={`${activeTabBulletin === item.name ? 'block' : 'hidden'}`}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}