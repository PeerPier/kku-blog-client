import axios from "axios"
import { useCallback, useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { API_BASE_URL } from "../api/const/apiBaseUrl"
import AnimationWrapper from "./page-animation"
import Loader from "../components/loader.component"
import "../misc/profile.css"
import { UserContext } from "../App"
import AboutUser from "../components/about.component"
import { Post } from "../types/post"
import { filterPaginationData } from "../components/filter-pagination"
import BlogCard from "../components/blogpost.component"
import NoDataMessage from "../components/nodata.component"
import LoadMoreDataBtn from "../components/load-more.component"
import InPageNavigation from "../components/Inpage-navigation"
import PageNotFound from "./404"

import {
  fetchLikedPosts,
  fetchPostsByUser,
  fetchSavedPosts,
  fetchUserProfile,
} from "../api/profile"
import { FollowerModal } from "./follower-modal"
import { FollowingModal } from "./following-modal"

export const profileData = {
  fullname: "",
  username: "",
  profile_picture: "",
  bio: "",
  total_posts: 0,
  total_reads: 0,
  total_blogs: 0,
  social_links: {},
  joinedAt: " ",
}

interface BlogState {
  result: Post[]
  totalDocs: number
  page: number
  user_id?: string
}

const ProfilePage = () => {
  const { id: profileId } = useParams()
  const [profile, setProfile] = useState(profileData)
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState<BlogState | null>(null)
  const [profileLoaded, setProfileLoaded] = useState("")

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [checkUser, setCheckUser] = useState<boolean>(false)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const userId = sessionStorage.getItem("userId")

  let {
    fullname,
    username: profile_username,
    profile_picture,
    bio,
    total_posts,
    total_reads,
    social_links,
    joinedAt,
  } = profile

  let {
    userAuth: { username },
  } = useContext(UserContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const profileData = await fetchUserProfile(id)
          setUserProfile(profileData)
          setCheckUser(sessionStorage.getItem("userId") === id)
          setIsFollowing(
            profileData.followers.includes(sessionStorage.getItem("userId"))
          )
          // ดึงบล็อกที่ผู้ที่ Login โพสต์
          const posts = await fetchPostsByUser(id)

          // กรองเฉพาะบล็อกที่ถูกโพสต์โดยผู้ใช้ที่ login
          const loggedInUserId = sessionStorage.getItem("userId")
          const filteredPosts = posts.filter(
            (post: Post) => post.author._id === loggedInUserId
          )

          // ตั้งค่าบล็อกที่กรองแล้ว
          setUserPosts(filteredPosts)

          // ดึงบล็อกที่ผู้ใช้กดถูกใจ
          const liked = await fetchLikedPosts(id)
          const filteredLiked = liked.filter((post: Post[]) => post !== null)
          console.log("Fetched liked posts in Profile:", filteredLiked)
          setLikedPosts(filteredLiked as Post[])

          // ดึงบล็อกที่ผู้ใช้บันทึก
          const saved = await fetchSavedPosts(id)
          const filteredSaved = saved.filter((post: Post[]) => post !== null)
          console.log("Fetched save posts in Profile:", filteredSaved)
          setSavedPosts(filteredSaved as Post[])
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    }
    fetchData()
  }, [id])

  const fetchUserProfiles = () => {
    axios
      .post(API_BASE_URL + "/users/get-profile", {
        id: profileId,
      })
      .then(({ data: user }) => {
        if (user !== null) {
          setProfile(user)
        }
        if (profileId) {
          setProfileLoaded(profileId)
        }
        getBlogs({ user_id: user._id })
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      })
  }

  const getBlogs = ({
    page = 1,
    user_id,
  }: {
    _id?: string
    page?: number
    user_id?: string
  }) => {
    user_id = user_id === undefined ? blogs?.user_id : user_id
    axios
      .post(API_BASE_URL + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatedDate = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        })
        formatedDate.user_id = user_id
        setBlogs(formatedDate)
      })
  }

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null)
    }

    if (blogs === null) {
      resetState()
      fetchUserProfiles()
    }
  }, [profileId, blogs])

  const resetState = () => {
    setProfile(profileData)
    setLoading(true)
    setProfileLoaded("")
  }

  const handleFollow = useCallback(async () => {
    const API_BASE_URL = "http://localhost:3001/follow"
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ me: sessionStorage.getItem("userId"), you: id }),
      })

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText} for ${API_BASE_URL}`
        )
      }

      const followerData = await response.json()
      setUserProfile(followerData.newFollow)
      setIsFollowing(followerData.newFollow.if_followed)
    } catch (error: any) {
      console.error("Error:", error.message)
    }
  }, [id, isFollowing])

  const handleUnfollow = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ me: sessionStorage.getItem("userId"), you: id }),
      })
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error"
        throw new Error(
          `Server returned ${response.status} ${statusText} for ${API_BASE_URL}/follow/delete`
        )
      }
      const res = await response.json()
      setUserProfile(res.unFollow)
      setIsFollowing(false)
    } catch (error) {
      console.error("Error:", (error as Error).message)
    }
  }, [id, isFollowing])

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className='h-cover d-md-flex flex-row-reverse align-items-start profilepage '>
          <div className='d-flex flex-column profile_img gap-1 text-center'>
            <img src={profile_picture} alt='' className='rounded-circle ' />

            <h1 className='fw-medium fs-6 mt-2'>@{profile_username}</h1>
            <p
              className='m-0'
              style={{ textTransform: "capitalize", height: "1.5rem" }}
            >
              {fullname}
            </p>

            <p className='m-0 mt-2'>
              {total_posts.toLocaleString()} บล็อก -
              {total_reads.toLocaleString()} อ่าน
            </p>
            <div className='follow'>
              {userProfile && (
                <div className='follow-item'>
                  <FollowerModal userProfile={userProfile} />{" "}
                  <span>{userProfile.followersCount}</span>
                </div>
              )}
              <div className='bar-icon'></div>
              {userProfile && (
                <div className='follow-item'>
                  <FollowingModal userProfile={userProfile} />{" "}
                  <span>{userProfile.followingCount} </span>
                </div>
              )}
            </div>

            {/* <div className="d-flex gap-2 mt-2">
              {profileId === username ? (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-3"
                >
                  แก้ไขโปรไฟล์
                </Link>
              ) : (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-3"
                >
                  Follow
                </Link>
              )}
            </div> */}
            {checkUser ? (
              <div className='edit d-flex justify-content-center my-4'>
                <Link
                  to='/settings/edit-profile'
                  className='btn-light rounded-3'
                >
                  แก้ไขโปรไฟล์
                </Link>
              </div>
            ) : (
              <div className='edit d-flex justify-content-center my-4'>
                <p
                  className='btn-light rounded-3'
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </p>
              </div>
            )}

            <AboutUser
              className='max-md'
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className='blogOfuser w-100'>
            <InPageNavigation
              routes={["บล็อกที่เผยแพร่", "เกี่ยวกับ"]}
              defaultHidden={["เกี่ยวกับ"]}
            >
              <>
                {blogs === null ? (
                  <Loader />
                ) : blogs.result.length ? (
                  blogs.result.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <BlogCard content={blog} author={blog.author} />
                      </AnimationWrapper>
                    )
                  })
                ) : (
                  <NoDataMessage message='ไม่มีบล็อกที่เผยแพร่' />
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </>

              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  )
}

// const ProfilePage = ()=>{
//   return <>test</>
// }
export default ProfilePage
