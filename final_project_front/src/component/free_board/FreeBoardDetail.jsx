import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import ImportExportOutlinedIcon from "@mui/icons-material/ImportExportOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko.js";
import Swal from "sweetalert2";
import { useRecoilState } from "recoil";
import {
  loginIdState,
  memberNoState,
  memberTypeState,
} from "../utils/RecoilData";
import BaseModal from "../utils/BaseModal";
import PageNavigation from "../utils/PageNavigation";

const FreeBoardDetail = () => {
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const [member, setMember] = useRecoilState(loginIdState);
  const [memberNo, setMemberNo] = useRecoilState(memberNoState);
  //const [freeBoardCommentMemberNo, setFreeBoardCommentMemberNo] = useState(); //댓글 작성자
  const [freeBoardMemberNo, setFreeBoardMemberNo] = useState(); //게시글 작성자
  const [memberType, setMemberType] = useRecoilState(memberTypeState);
  const params = useParams();
  const freeBoardNo = params.freeBoardNo; //main content에서 받아온 freeBoardNo
  const viewCount = params.viewCount;
  const [freeBoard, setFreeBoard] = useState({});
  const [freeBoardComment, setFreeBoardComment] = useState([
    { freeBoardCommentNo: 0 },
  ]); //해당 게시글에 대한 번호
  const [fbCommentContent, setFbCommentContent] = useState(""); //게시글에 대한 댓글
  const [fbCommentNo, setFbCommentNo] = useState();
  const [modifyFbCommentContent, setModifyFbCommentContent] = useState(""); //수정할 댓글 입력
  const [modifyCommentNo, setModifyCommentNo] = useState(); //댓글 수정 시 해당 번호
  const [toDate, setToDate] = useState(); //사용할 시간
  const [freeBoardCategory, setFreeBoardCategory] = useState("");
  const [freeBoardSubCategory, setFreeBoardSubcategory] = useState("");
  const navigate = useNavigate();
  const [fbClaimReason, setFbClaimReason] = useState();
  const [fbcClaimReason, setFbcClaimReason] = useState();

  const [fbClaimSet, setFbClaimSet] = useState();
  const [fbcClaimSet, setFbcClaimSet] = useState();
  //새로고침 시 좋아요 유지

  /*
  const [like, setLike] = useState(() => {
    const saved = localStorage.getItem("like");
    return saved === "true";
  });
  */
  const [like, setLike] = useState(true);

  axios
    .get(
      `${
        import.meta.env.VITE_BACK_SERVER
      }/freeBoard/isLike/${memberNo}/${freeBoardNo}`
    )
    .then((res) => {
      console.log(res.data);
      setLike(res.data);
    })
    .catch((err) => {
      navigate("/pageerror");
    });
  console.log(like);

  // 좋아요를 누르면 로컬스토리지에 저장된 commentLike를 객체로 만듦
  const [commentLike, setCommentLike] = useState(() => {
    const commentSaved = localStorage.getItem(`commentLike`);
    return commentSaved ? JSON.parse(commentSaved) : {}; //commentSaved 객체 변경
  });
  //commentLike를 json형태로 만든 후 commentLike를 로컬스토리지에 저장(set)
  useEffect(() => {
    localStorage.setItem("like", like);
    localStorage.setItem("commentLike", JSON.stringify(commentLike)); //commentLike를 Json으로 변경후 localStorage에 저장
  }, [like, commentLike]);
  const [commentCount, setCommentCount] = useState(0);
  //댓글 페이징 처리
  const [reqPageInfo, setReqPageInfo] = useState({
    sideBtnCount: 3, // 현재 페이지 양옆에 버튼을 몇개 둘껀데?
    pageNo: 1, //몇번째 페이지를 요청하는데? (페이징에서 씀)
    listCnt: 10, //한 페이지에 몇개 리스트를 보여줄건데? (페이징에서 씀)
    order: 2, //최신순, 오래된 순
  });
  const [totalListCount, setTotalListCount] = useState();

  useEffect(() => {
    if (fbClaimSet === undefined) {
      return;
    }
    //URI 정리 (Restful하게 하기.)
    // [POST] freeBoard/${freeBoardNo}/claim
    //  -- 자유 게시판에 -> 몇번의 게시글을 -> 신고 (insert : POST)
    axios
      .post(
        `${import.meta.env.VITE_BACK_SERVER}/freeBoard/${
          fbClaimSet.freeBoardNo
        }/claim`,
        fbClaimSet
      )
      .then((res) => {
        if (res.data === 1) {
          Swal.fire({
            title: "알림",
            text: `게시글 신고가 완료되었습니다.`,

            icon: "success",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "알림",
          text: `이미 신고한 게시글입니다.`,

          icon: "error",
        });
      });
  }, [fbClaimSet]);

  useEffect(() => {
    if (fbcClaimSet === undefined) {
      return;
    }
    axios
      .post(
        `${import.meta.env.VITE_BACK_SERVER}/freeBoard/comment/${
          fbcClaimSet.fbCommentNo
        }/claim`,
        fbcClaimSet
      )
      .then((res) => {
        if (res.data === 1) {
          Swal.fire({
            title: "알림",
            text: `댓글 신고가 완료되었습니다.`,

            icon: "success",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "알림",
          text: `이미 신고한 댓글입니다.`,

          icon: "error",
        });
      });
  }, [fbcClaimSet]);

  const comment = {
    freeBoardNo: freeBoardNo,
    freeBoardSubcategoryNo: freeBoard.freeBoardSubcategoryNo,
    freeBoardCategoryNo: freeBoard.freeBoardCategoryNo,
    memberNo: memberNo,
    fbCommentContent: fbCommentContent,
  };
  dayjs.extend(relativeTime);

  // 기존 한국어 locale 불러오기
  const locale = {
    ...dayjs.Ls["ko"],
    // 숫자를 한글이 아닌 아라비아 숫자로 표시하도록 커스터마이징
    relativeTime: {
      future: "%s 후",
      past: "%s 전",
      s: "몇 초",
      m: "1분",
      mm: "%d분",
      h: "1시간",
      hh: "%d시간",
      d: "1일",
      dd: "%d일",
      M: "1달",
      MM: "%d달",
      y: "1년",
      yy: "%d년",
    },
  };

  // 커스터마이징한 locale 적용
  dayjs.locale(locale, null, true);
  dayjs.locale("ko");

  const nowDate = (dateString) => {
    const now = dayjs(); //현재 날짜/시간 가져오는 함수
    const target = dayjs(dateString); // 날짜를 dayjs 형식으로 변환하기
    const diffDays = now.diff(target, "day"); // 현재날짜와 지난날짜와 비교
    // 보낸날짜가 17일이면 오늘이 19일 그럼 2일전 표시이렇게 자동으로 계산

    if (diffDays >= 7) {
      return target.format("YYYY-MM-DD"); // 7일 이상이면 날짜로 변형
    }
    return target.fromNow(); //한국어로 ?? 시간전 표시하기
  };

  const [toggle, setToggle] = useState(false); //댓글 등록 시 랜더링 state
  useEffect(() => {
    console.log("아아 들어옴");
    console.log(freeBoardNo);
    axios
      .get(`${backServer}/freeBoard/detail/${freeBoardNo}`)
      .then((res) => {
        setFreeBoard(res.data);
        console.log(res.data);
        setToDate(res.data.freeBoardDate);
        setFreeBoardMemberNo(
          memberNo === res.data.memberNo && res.data.memberNo
        );
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [freeBoardNo, toggle]);

  useEffect(() => {
    axios
      .get(
        `${backServer}/freeBoard/detail/comment?freeBoardNo=${freeBoardNo}
        &pageNo=${reqPageInfo.pageNo}
        &listCnt=${reqPageInfo.listCnt}
        &sideBtnCount=${reqPageInfo.sideBtnCount}
        &order=${reqPageInfo.order}`
      )
      .then((res) => {
        console.log(res.data);
        setFreeBoardComment(res.data.freeBoardCommentList);
        setTotalListCount(res.data.totalListCount);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [
    freeBoardNo,
    fbCommentContent,
    toggle,
    modifyFbCommentContent,
    reqPageInfo.pageNo,
    reqPageInfo.order,
  ]);
  const commentResist = () => {
    if (member === null || member === "") {
      Swal.fire({
        title: "로그인",
        text: "로그인 후 이용해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        navigate("/member/login");
      });
      return;
    }
    if (fbCommentContent === "" || fbCommentContent === null) {
      Swal.fire({
        title: "댓글 입력",
        text: "댓글을 입력해주세요",
        icon: "warning",
        confirmButtonText: "확인",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      return;
    } else {
      axios
        .post(`${backServer}/freeBoard/detail/regist`, comment)
        .then((res) => {
          if (res.data === 1) {
            setFbCommentContent("");
          }
        })
        .catch((err) => {
          navigate("/pageerror");
        });
    }
  };
  const freeBoardModify = () => {
    navigate(`/freeBoard/modify/${freeBoardNo}`);
  };
  const freeBoardDelete = () => {
    Swal.fire({
      title: "게시글 삭제",
      text: "게시글을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    })
      .then((confirm) => {
        if (confirm.isConfirmed) {
          axios
            .delete(`${backServer}/freeBoard/detail/delete/${freeBoardNo}`)
            .then((res) => {
              console.log(res.data);
              if (res.data === 1) {
                Swal.fire({
                  title: "삭제 완료",
                  icon: "success",
                  confirmButtonText: "확인",
                }).then((confirm) => {
                  if (confirm.isConfirmed) {
                    navigate("/freeBoard/content");
                  }
                });
              }
            })
            .catch((err) => {
              navigate("/pageerror");
            });
        }
      })
      .catch(() => {
        navigate("/pageerror");
      });
  };
  const [cmtModify, setCmtModify] = useState(null); // 댓글 수정버튼 클릭 시 해당 회원만 보이게
  const [commentNo, setCommentNo] = useState(null); // 클릭한 댓글만 수정할 수 있는 창이 뜨도록 댓글번호 저장
  const modifyComment = (fbc) => {
    setCmtModify(fbc);
  };

  const patchComment = {
    fbCommentNo: commentNo,
    fbCommentContent: modifyFbCommentContent,
  };
  const updateComment = () => {
    if (
      modifyFbCommentContent === "" ||
      modifyFbCommentContent === " " ||
      modifyFbCommentContent === null
    ) {
      Swal.fire({
        title: "댓글 입력",
        text: "댓글을 입력해주세요.",
        icon: "warning",
      });
      return;
    } else {
      axios
        .patch(`${backServer}/freeBoard/detail/update`, patchComment)
        .then((res) => {
          if (res.data === 1) {
            Swal.fire({
              title: "수정 완료",
              icon: "success",
            }).then(() => {
              setToggle(!toggle);
              setModifyFbCommentContent("");
            });
          }
        })
        .catch((err) => {
          navigate("/pageerror");
        });
    }
  };
  /* 좋아요 */
  const clickLike = () => {
    if (!member) {
      Swal.fire({
        title: "로그인",
        text: "로그인 후 이용해주세요.",
        icon: "warning",
      });
      navigate("/member/login");
    } else {
      axios //조회 후 null이면 insert / !null delete
        .get(
          `${backServer}/freeBoard/detail/selectLike?memberNo=${
            memberNo ? memberNo : 0
          }&freeBoardNo=${freeBoardNo}&freeBoardSubcategoryNo=${
            comment.freeBoardSubcategoryNo
          }&freeBoardCategoryNo=${comment.freeBoardCategoryNo}`
        )
        .then((res) => {
          if (res.data !== "" || res.data !== undefined) {
            setToggle(!toggle);
            setLike(!like);
          }
        })
        .catch((err) => {
          navigate("/pageerror");
        });
    }
  };
  const [recommends, setRecommends] = useState();

  useEffect(() => {
    axios
      .get(`${backServer}/freeBoard/detail/${freeBoardNo}/recommends`)
      .then((res) => {
        console.log(res.data);
        setRecommends(res.data);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [freeBoardNo]);

  const prevFreeBoard = (
    freeBoardNo,
    freeBoardCategoryNo,
    freeBoardSubcategoryNo
  ) => {
    console.log(freeBoardNo);
    console.log(freeBoardCategoryNo);
    console.log(freeBoardSubcategoryNo);
    axios
      .get(
        `${backServer}/freeBoard/detail/${freeBoardCategoryNo}/${freeBoardSubcategoryNo}/${freeBoardNo}`
      )
      .then((res) => {
        console.log(res.data);
        if (res.data.freeBoardNo === undefined) {
          Swal.fire({
            title: "경고",
            text: `이전 글이 없습니다.`,

            icon: "success",
          });
          return;
        }
        navigate(`/freeBoard/detail/${res.data.freeBoardNo}/${viewCount}`);
        setToggle(!toggle);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  };
  const nextFreeBoard = (
    freeBoardNo,
    freeBoardCategoryNo,
    freeBoardSubcategoryNo
  ) => {
    console.log(freeBoardNo);
    console.log(freeBoardCategoryNo);
    console.log(freeBoardSubcategoryNo);
    axios
      .get(
        `${backServer}/freeBoard/detail/next/${freeBoardCategoryNo}/${freeBoardSubcategoryNo}/${freeBoardNo}`
      )
      .then((res) => {
        console.log(res.data);
        if (res.data.freeBoardNo === undefined) {
          Swal.fire({
            title: "경고",
            text: `다음 글이 없습니다.`,

            icon: "success",
          });
          return;
        }
        navigate(`/freeBoard/detail/${res.data.freeBoardNo}/${viewCount}`);
        setToggle(!toggle);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  };
  console.log(freeBoard);
  useEffect(() => {
    axios
      .get(
        `${backServer}/freeBoard/detail/freeBoardcate?freeBoardNo=${freeBoardNo}`
      )
      .then((res) => {
        setFreeBoardCategory(res.data.freeBoardCategory);
        setFreeBoardSubcategory(res.data.freeBoardSubcategory);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [freeBoardNo]);

  return (
    /* 상세페이지  */
    <div className="detail-container">
      <div className="detail-path">
        홈 &gt; 자유게시판 &gt; {freeBoardCategory} &gt; {freeBoardSubCategory}
      </div>
      <div className="detail-title-section">
        <div className="detail-title">{freeBoard.freeBoardTitle}</div>
        {(memberType === 1 || freeBoardMemberNo === memberNo) && (
          <div className="detail-buttonBox">
            <button className="modify-btn" onClick={freeBoardModify}>
              수정
            </button>
            <button className="delete-btn" onClick={freeBoardDelete}>
              삭제
            </button>
          </div>
        )}
      </div>
      <div className="detail-view">
        <div className="view">
          <VisibilityOutlinedIcon></VisibilityOutlinedIcon>
          {viewCount}
        </div>
        <div
          className="heart"
          style={{ cursor: "pointer" }}
          onClick={() => {
            clickLike();
          }}
        >
          {like ? (
            <FavoriteIcon
              style={{
                color: "red",
                userSelect: "none",
                fill: "#ff2b2b",
              }}
            />
          ) : (
            <FavoriteBorderOutlinedIcon style={{ userSelect: "none" }} />
          )}
          {freeBoard.likeCount}
        </div>
        <div className="hour">
          <AccessTimeOutlinedIcon></AccessTimeOutlinedIcon>
          {nowDate(toDate)}
        </div>
      </div>
      <hr className="detail-line" />
      <div className="detail-main">
        <div className="detail-content">
          {freeBoard.freeBoardThumbnail !== null && (
            <img
              src={freeBoard.freeBoardThumbnail}
              alt="thumbnail"
              className="detail-image-box"
            ></img>
          )}
          <div
            className="detail-freeBoardContent"
            style={{ marginLeft: "10px" }}
            dangerouslySetInnerHTML={{ __html: freeBoard.freeBoardContent }}
          ></div>
        </div>
        <div className="recommend-box">
          <div className="recommend-title">추천글</div>
          <ul>
            {recommends &&
              recommends.map((recommend, i) => {
                console.log(recommend);
                return (
                  <li
                    key={"recommend-" + i}
                    className="recommendsBtn"
                    onClick={() => {
                      navigate(
                        `/freeBoard/detail/${recommend.freeBoardNo}/${viewCount}`
                      );
                      setToggle(!toggle);
                    }}
                  >
                    {recommend.freeBoardTitle}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className="detail-report">
        <BaseModal
          title="게시글 신고하기"
          content={
            <div className="report_content">
              <div>해당 게시글을 신고하시겠습니까?</div>

              <div>
                <input
                  type="text"
                  value={fbClaimReason}
                  onChange={(e) => {
                    setFbClaimReason(e.target.value);
                  }}
                  placeholder="신고 사유를 적어주세요"
                ></input>
              </div>
            </div>
          }
          buttonLabel={
            <span>
              <ReportGmailerrorredIcon
                className="report-icon"
                style={{ width: "22px", height: "22px" }}
              />
              신고하기
            </span>
          }
          contentBoxStyle={{ width: "400px", height: "400px" }}
          end={"취소"}
          result={
            <button
              onClick={() => {
                setFbClaimSet({
                  freeBoardNo: freeBoard.freeBoardNo,
                  fbClaimReason: fbClaimReason,
                  memberNo: memberNo,
                });
              }}
              className="FbClaimConfirmBtn"
            >
              확인
            </button>
          }
        />
      </div>
      <div className="detail-buttons">
        <button
          className="list-btn"
          onClick={() => {
            navigate("/freeBoard/content");
          }}
        >
          목록으로
        </button>
        <div>
          <button
            className="prev-btn"
            onClick={() => {
              console.log(freeBoard);
              prevFreeBoard(
                freeBoard.freeBoardNo,
                freeBoard.freeBoardCategoryNo,
                freeBoard.freeBoardSubcategoryNo
              );
            }}
          >
            이전글
          </button>
          <button
            className="next-btn"
            onClick={() => {
              console.log(freeBoard);
              nextFreeBoard(
                freeBoard.freeBoardNo,
                freeBoard.freeBoardCategoryNo,
                freeBoard.freeBoardSubcategoryNo
              );
            }}
          >
            다음글
          </button>
        </div>
      </div>
      <div className="comment-section">
        <div className="comment-header">
          <span>
            댓글
            {freeBoardComment[0].totalCommentCount !== 0 &&
              freeBoardComment[0].totalCommentCount}
          </span>
          <span
            className="comment-order"
            onClick={() => {
              {
                reqPageInfo.order === 2
                  ? setReqPageInfo({ ...reqPageInfo, order: 1 })
                  : setReqPageInfo({ ...reqPageInfo, order: 2 });
              }
            }}
          >
            {reqPageInfo.order === 2 ? (
              <span>최신순</span>
            ) : (
              <span>오래된순</span>
            )}
            <ImportExportOutlinedIcon></ImportExportOutlinedIcon>
          </span>
        </div>
        <div className="comment-input">
          <textarea
            type="text"
            placeholder="댓글을 남겨주세요."
            name={fbCommentContent}
            value={fbCommentContent}
            onChange={(e) => {
              setFbCommentContent(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (member === null || member === "") {
                  Swal.fire({
                    title: "로그인",
                    text: "로그인 후 이용해주세요.",
                    icon: "warning",
                    confirmButtonText: "확인",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                  }).then(() => {
                    navigate("/member/login");
                  });
                  return;
                } else if (
                  fbCommentContent === "" ||
                  fbCommentContent === null
                ) {
                  Swal.fire({
                    title: "댓글 입력",
                    text: "댓글을 입력해주세요",
                    icon: "warning",
                    confirmButtonText: "확인",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                  });
                  return;
                } else {
                  axios
                    .post(`${backServer}/freeBoard/detail/regist`, comment)
                    .then((res) => {
                      if (res.data === 1) {
                        Swal.fire({
                          title: "댓글 등록 완료",
                          icon: "success",
                        });
                        setFbCommentContent("");
                      }
                    })
                    .catch((err) => {
                      navigate("/pageerror");
                    });
                }
              }
            }}
          />
          <button
            className="comment-submit"
            onClick={() => {
              commentResist();
            }}
          >
            등록
          </button>
        </div>
        {freeBoardComment[0].totalCommentCount !== 0 && (
          <div className="comment-box">
            {freeBoardComment.map((comment, i) => {
              return (
                <div
                  className={
                    i + 1 === freeBoardComment.length
                      ? "comment-item end"
                      : "comment-item"
                  }
                  key={"item" + i}
                >
                  <div className="comment-report">
                    <div className="comment-writer">
                      <span>{comment.memberNickname}</span>
                      <span>{comment.memberId}</span>
                    </div>
                    <BaseModal
                      title="댓글 신고하기"
                      content={
                        <div className="report_content">
                          <div>해당 댓글을 신고하시겠습니까?</div>

                          <div>
                            <input
                              type="text"
                              value={fbcClaimReason}
                              onChange={(e) => {
                                setFbcClaimReason(e.target.value);
                              }}
                              placeholder="신고 사유를 적어주세요"
                            ></input>
                          </div>
                        </div>
                      }
                      buttonLabel={
                        <span>
                          <ReportGmailerrorredIcon
                            className="report-icon"
                            style={{ width: "20px", height: "20px" }}
                          />
                          신고하기
                        </span>
                      }
                      contentBoxStyle={{ width: "400px", height: "400px" }}
                      end={"취소"}
                      result={
                        <button
                          onClick={() => {
                            setFbcClaimSet({
                              fbCommentNo: comment.fbCommentNo,
                              memberNo: memberNo,
                              fbcClaimReason: fbcClaimReason,
                            });
                          }}
                          className="FbClaimConfirmBtn"
                        >
                          확인
                        </button>
                      }
                    />
                  </div>

                  {(memberType === 1 || comment.memberNo === memberNo) &&
                    cmtModify === comment.fbCommentNo && (
                      <div className="comment-modify">
                        <textarea
                          type="text"
                          placeholder="댓글을 남겨주세요."
                          name={modifyFbCommentContent}
                          value={modifyFbCommentContent}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                modifyFbCommentContent === "" ||
                                modifyFbCommentContent === " " ||
                                modifyFbCommentContent === null
                              ) {
                                Swal.fire({
                                  title: "댓글 입력",
                                  text: "댓글을 입력해주세요.",
                                  icon: "warning",
                                });
                                return;
                              } else {
                                axios
                                  .patch(
                                    `${backServer}/freeBoard/detail/update`,
                                    patchComment
                                  )
                                  .then((res) => {
                                    if (res.data === 1) {
                                      Swal.fire({
                                        title: "수정 완료",
                                        icon: "success",
                                      }).then(() => {
                                        setCmtModify(null);
                                        setModifyFbCommentContent("");
                                      });
                                    }
                                  })
                                  .catch((err) => {
                                    navigate("/pageerror");
                                  });
                              }
                            }
                          }}
                          onChange={(e) => {
                            (e.key === "Enter") !==
                              setModifyFbCommentContent(e.target.value);
                          }}
                        />
                        <button
                          className="comment-modify-btn"
                          onClick={() => {
                            setCmtModify(null);
                            setCommentNo(null);
                            updateComment();
                          }}
                        >
                          댓글수정
                        </button>
                      </div>
                    )}
                  {cmtModify !== comment.fbCommentNo && (
                    <div
                      className="comment-text"
                      dangerouslySetInnerHTML={{
                        __html: comment.fbCommentContent,
                      }}
                    ></div>
                  )}

                  <div
                    className="comment-sub"
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    <div
                      className="heart"
                      onClick={() => {
                        setFbCommentNo(comment.fbCommentNo);
                        if (!member) {
                          Swal.fire({
                            title: "로그인",
                            text: "로그인 후 이용해주세요.",
                            icon: "warning",
                          });
                          navigate("/member/login");
                        } else {
                          axios //조회 후 null이면 insert / !null delete
                            .get(
                              `${backServer}/freeBoard/detail/commentLike?memberNo=${memberNo}&fbCommentNo=${comment.fbCommentNo}`
                            )
                            .then((res) => {
                              if (res.data !== "" && res.data !== undefined) {
                                setCommentLike((p) => ({
                                  ...p,
                                  [comment.fbCommentNo]:
                                    !p[comment.fbCommentNo],
                                }));
                                setToggle(!toggle);
                              }
                            })
                            .catch((err) => {
                              navigate("/pageerror");
                            });
                        }
                      }}
                    >
                      {commentLike[comment.fbCommentNo] ? (
                        <FavoriteIcon
                          style={{
                            color: "red",
                            userSelect: "none",
                            fill: "#ff2b2b",
                          }}
                        />
                      ) : (
                        <FavoriteBorderOutlinedIcon
                          style={{ userSelect: "none" }}
                        />
                      )}
                      {comment.commentLikeCount}
                    </div>
                    <div className="hour">
                      <AccessTimeOutlinedIcon></AccessTimeOutlinedIcon>
                      {nowDate(comment.fbCommentDate)}
                    </div>
                  </div>
                  {(memberType === 1 || comment.memberNo === memberNo) &&
                    cmtModify !== comment.fbCommentNo && (
                      <div className="comment-button">
                        <button
                          className="modify-btn"
                          onClick={() => {
                            setCommentNo(comment.fbCommentNo);
                            modifyComment(comment.fbCommentNo);
                            setModifyCommentNo(comment.fbCommentNo);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            Swal.fire({
                              title: "삭제",
                              text: "댓글을 삭제하시겠습니까?",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "확인",
                              cancelButtonText: "취소",
                            }).then((confirm) => {
                              if (confirm.isConfirmed) {
                                axios
                                  .delete(
                                    `${backServer}/freeBoard/detail/deleteComment/${comment.fbCommentNo}`
                                  )
                                  .then((res) => {
                                    console.log(res);
                                    if (res.data === 1) {
                                      Swal.fire({
                                        title: "댓글 삭제 완료",
                                        text: "댓글 삭제가 완료되었습니다.",
                                        icon: "success",
                                      }).then(() => {
                                        setToggle(!toggle);
                                      });
                                    }
                                  })
                                  .catch((err) => {
                                    navigate("/pageerror");
                                  });
                              }
                            });
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="page-navi comment">
        <PageNavigation
          reqPageInfo={reqPageInfo}
          setReqPageInfo={setReqPageInfo}
          totalListCount={totalListCount}
          setTotalListCount={setTotalListCount}
          setFreeBoardComment={setFreeBoardComment}
          FreeBoardComment={freeBoardComment}
        ></PageNavigation>
      </div>
    </div>
  );
};

export default FreeBoardDetail;
