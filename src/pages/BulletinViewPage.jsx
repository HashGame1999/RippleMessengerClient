import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import BulletinLink from '../components/Bulletin/BulletinLink'
import BulletinContent from '../components/Bulletin/BulletinContent'
import BulletinFileLink from '../components/Bulletin/BulletinFileLink'
import TextTimestamp from '../components/TextTimestamp'
import BulletinTools from '../components/Bulletin/BulletinTools'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BsMarkdown, BsFiletypeTxt } from "react-icons/bs"
import BulletinPublish from '../components/Bulletin/BulletinPublish'
import BulletinForward from '../components/Bulletin/BulletinForward'

export default function BulletinViewPage() {

  const [isMarkdown, setIsMarkdown] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const bulletin_hash = searchParams.get('hash')
  const bulletin_address = searchParams.get('address')
  const bulletin_sequence = searchParams.get('sequence')
  const sour_address = searchParams.get('sour_address')

  const dispatch = useDispatch()

  // const { bulletin_hash } = useParams()
  const { ShowPublishFlag, ShowForwardFlag } = useSelector(state => state.Messenger)
  const { CurrentBulletin } = useSelector(state => state.Messenger)

  useEffect(() => {
  }, [dispatch])

  useEffect(() => {
    dispatch({
      type: 'LoadBulletin', payload: {
        hash: bulletin_hash,
        address: bulletin_address,
        sequence: parseInt(bulletin_sequence),
        to: sour_address
      }
    })
  }, [bulletin_hash])

  return (
    <div className="p-1 mt-2 card">
      {
        ShowPublishFlag &&
        <BulletinPublish />
      }
      {
        ShowForwardFlag &&
        <BulletinForward />
      }
      {
        CurrentBulletin !== null && CurrentBulletin !== undefined &&
        <div className={`flex flex-row mx-2 mt-5`}>
          <div className={` flex flex-col justify-center items-center pt-5x`}>
            <div className='items-center flex flex-row justify-center'>
              <Avatar address={CurrentBulletin.Address} timestamp={Date.now()} style={'avatar'} />
            </div>
            <BulletinLink address={CurrentBulletin.Address} sequence={CurrentBulletin.Sequence} hash={CurrentBulletin.Hash} />
            <TextTimestamp timestamp={CurrentBulletin.SignedAt} textSize={'text-xs'} />

            <BulletinTools address={CurrentBulletin.Address} sequence={CurrentBulletin.Sequence} hash={CurrentBulletin.Hash} json={CurrentBulletin.Json} content={CurrentBulletin.Content} />
            <div className={`flex flex-row`}>

            </div>
            {
              CurrentBulletin.Quote.length !== 0 &&
              <div className='flex flex-wrap'>
                {CurrentBulletin.Quote.map((quote, index) => (
                  <div key={quote.Hash} className='text-xs text-gray-200 mt-1 px-1'>
                    <BulletinLink address={quote.Address} sequence={quote.Sequence} hash={quote.Hash} sour_address={CurrentBulletin.Address} />
                  </div>
                ))}
              </div>
            }
            {
              CurrentBulletin.File.length !== 0 &&
              <div className='flex flex-wrap'>
                {CurrentBulletin.File.map((file, index) => (
                  <div key={file.Hash} className='text-xs text-gray-200 mt-1 px-1'>
                    <BulletinFileLink name={file.Name} ext={file.Ext} size={file.Size} hash={file.Hash} />
                  </div>
                ))}
              </div>
            }
          </div>

          <div className={`min-w-[800px] p-2`}>
            <div className='mb-1'>
              {
                isMarkdown ?
                  <BsFiletypeTxt className="icon-sm" onClick={() => { setIsMarkdown(false) }} />
                  :
                  <BsMarkdown className="icon-sm" onClick={() => { setIsMarkdown(true) }} />
              }
            </div>
            {
              isMarkdown ?
                <div className={`p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700`}>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-4xl font-bold my-4" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-semibold my-3" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-semibold my-3" {...props} />
                      ),
                      ul({ depth, ordered, className, children, ...props }) {
                        return (
                          <ul
                            className={`list-disc pl-6 ${className}`}
                            style={{ paddingLeft: depth * 20 + 'px' }}
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      },
                      ol({ depth, ordered, className, children, ...props }) {
                        return (
                          <ol
                            className={`list-decimal pl-6 ${className}`}
                            style={{ paddingLeft: depth * 20 + 'px' }}
                            {...props}
                          >
                            {children}
                          </ol>
                        );
                      },
                      li({ className, children, ...props }) {
                        return (
                          <li className={`mb-2 ${className}`} {...props}>
                            {children}
                          </li>
                        );
                      }
                    }}
                  >
                    {CurrentBulletin.Content}
                  </Markdown>
                </div>
                :
                <BulletinContent content={CurrentBulletin.Content} />
            }
          </div>
        </div>
      }
    </div >
  )
}