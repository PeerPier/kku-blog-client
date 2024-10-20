import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../api/post";
import AnimationWrapper from "./page-animation";
import Loader from "../components/loader.component";
import "../misc/profile.css";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { Post } from "../types/post";
import { filterPaginationData } from "../components/filter-pagination";
import BlogCard from "../components/blogpost.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import InPageNavigation from "../components/Inpage-navigation";
import PageNotFound from "./404";

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
};

interface BlogState {
  result: Post[];
  totalDocs: number;
  page: number;
  user_id?: string;
}

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileData);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogState | null>(null);
  const [profileLoaded, setProfileLoaded] = useState("");

  let {
    fullname,
    username: profile_username,
    profile_picture,
    bio,
    total_posts,
    total_reads,
    social_links,
    joinedAt,
  } = profile;

  let {
    userAuth: { username },
  } = useContext(UserContext);

  const fetchUserProfile = () => {
    axios
      .post(API_BASE_URL + "/users/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user !== null) {
          console.log("User data: ", user);
          setProfile(user);
        }
        if (profileId) {
          setProfileLoaded(profileId);
        }
        getBlogs({ user_id: user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getBlogs = ({
    page = 1,
    user_id,
  }: {
    page?: number;
    user_id?: string;
  }) => {
    user_id = user_id === undefined ? blogs?.user_id : user_id;
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
        });
        formatedDate.user_id = user_id;
        console.log(formatedDate);
        setBlogs(formatedDate);
      });
  };

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  const resetState = () => {
    setProfile(profileData);
    setLoading(true);
    setProfileLoaded("");
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover d-md-flex flex-row-reverse align-items-start profilepage ">
          <div className="d-flex flex-column profile_img gap-1">
            <img src={profile_picture} alt="" className="rounded-circle " />

            <h1 className="fw-medium fs-6 mt-2">@{profile_username}</h1>
            <p
              className="m-0"
              style={{ textTransform: "capitalize", height: "1.5rem" }}
            >
              {fullname}
            </p>

            <p className="m-0 mt-2">
              {total_posts.toLocaleString()} บล็อก -
              {total_reads.toLocaleString()} อ่าน
            </p>

            <div className="d-flex gap-2 mt-2">
              {profileId === username ? (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-3"
                >
                  แก้ไขโปรไฟล์
                </Link>
              ) : (
                " "
              )}
            </div>

            <AboutUser
              className="max-md"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className="blogOfuser w-100">
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
                    );
                  })
                ) : (
                  <NoDataMessage message="ไม่มีบล็อกที่เผยแพร่" />
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
  );
};

export default ProfilePage;
