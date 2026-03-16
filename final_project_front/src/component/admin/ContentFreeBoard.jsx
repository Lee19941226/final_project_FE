import ReactQuill, { Quill } from "react-quill";
import "./contentFreeBoard.css";
import { useEffect, useState } from "react";
import { memberNoState, loginIdState } from "../utils/RecoilData";
import { useRecoilState } from "recoil";

import { FreeBoardSideMenuMap } from "../free_board/FreeBoardMain";
import axios from "axios";
import Swal from "sweetalert2";
import BaseModal from "../utils/BaseModal";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const ContentFreeBoard = () => {
  const [noticeValue, setNoticeValue] = useState("");
  const [refreshToggle, setRefreshToggle] = useState(true);

  const [memberNo, setMemberNo] = useRecoilState(memberNoState);
  const [memberId, setMemberId] = useRecoilState(loginIdState);
  const navigate = useNavigate();
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image", "blockquote", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
    "blockquote",
    "code-block",
  ];

  const [categoryAddText, setCategoryAddText] = useState("");

  const [subCategoryAddText, setSubCategoryAddText] = useState("");

  const [insertCate, setInsertCate] = useState();
  const [deleteCate, setDeleteCate] = useState();
  const [noticeTarget, setNoticeTarget] = useState("1");

  useEffect(() => {
    insertCate &&
      axios
        .post(
          `${import.meta.env.VITE_BACK_SERVER}/admin/insertFreeCate`,
          insertCate
        )
        .then((res) => {
          setRefreshToggle(!refreshToggle);
          Swal.fire({
            title: "알림",
            text: `카테고리 추가가 완료되었습니다.`,

            icon: "success",
          });
        })
        .catch((err) => {
          navigate("/pageerror");
        });
  }, [insertCate]);

  const [noticeSet, setNoticeSet] = useState();

  //console.log(noticeSet);

  const [noticeList, setNoticeList] = useState();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACK_SERVER}/admin/selectAllNotice`)
      .then((res) => {
        setNoticeList(res.data);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [refreshToggle]);
  useEffect(() => {
    noticeSet &&
      axios
        .post(
          `${import.meta.env.VITE_BACK_SERVER}/admin/insertNotice`,
          noticeSet
        )
        .then((res) => {
          setNoticeList(res.data);
        })
        .catch((err) => {
          Swal.fire({
            title: "경고",
            text: "공지사항을 입력하세요",
          });
        });
  }, [noticeSet]);

  useEffect(() => {
    if (deleteCate === undefined) {
      return;
    }

    //메인 카테고리에 입력된 값이 있고, 서브 카테고리에 입력된 값이 없으면
    if (categoryAddText && subCategoryAddText == "") {
      Swal.fire({
        title: "알림",
        text: "메인 카테고리에만 값을 입력하셨습니다. 하위 카테고리도 모두 삭제됩니다. 정말 삭제하시겠습니까?",
        showCancelButton: true,
        confirmButtonText: "네",
        cancelButtonText: "아니요",
      }).then((result) => {
        if (result.isConfirmed) {
          //여기서 메인 카테고리 삭제 로직 돌려야함
          axios
            .delete(
              `${import.meta.env.VITE_BACK_SERVER}/admin/${
                deleteCate.categoryAddText
              }`
            )
            .then((res) => {
              if (res.data === 1) {
                setRefreshToggle(!refreshToggle);
                Swal.fire({
                  title: "알림",
                  text: "메인 카테고리 삭제가 완료되었습니다.",
                });
              }
            })
            .catch((err) => {
              navigate("/pageerror");
            });
        }
      });
    } else if (categoryAddText && subCategoryAddText) {
      //여기서 메인/서브 카테고리 삭제 로직 돌려야 함

      //1. 입력된 값을 서버에 전송하고
      axios
        .delete(
          `${
            import.meta.env.VITE_BACK_SERVER
          }/admin/freeboard?delCate=${categoryAddText}&subCate=${subCategoryAddText}`
        )
        .then((res) => {
          if (res.data === 1) {
            setRefreshToggle(!refreshToggle);
            Swal.fire({
              title: "알림",
              text: "메인 카테고리 삭제가 완료되었습니다.",
            });
          }
        })
        .catch((err) => {
          Swal.fire({
            title: "알림",
            text: "값이 잘못 입력되었습니다. 다시 입력하세요",
          });
          navigate("/pageerror");
        });
      //2. 카테고리 번호를 리턴 받아오기
      //3. 카테고리 번호가 두개 모두 존재하면
      //3-1. 삭제 로직 실행
      //3-2.
      //4. 카테고리 번호가 하나라도 존재하지 않으면
      //4-1. 값이 잘못 입력되었습니다. 다시 입력하세요 팝업
    } else {
      Swal.fire({
        title: "알림",
        text: "값이 입력되지 않았습니다. 값을 입력하세요.",
        icon: "warning",
      });
    }
  }, [deleteCate]);

  const [delNoticeNo, setDelNoticeNo] = useState();

  useEffect(() => {
    delNoticeNo &&
      axios
        .delete(
          `${
            import.meta.env.VITE_BACK_SERVER
          }/admin/freeboard/notice/${delNoticeNo}/delete`
        )
        .then((res) => {
          if (res.data === 1) {
            setRefreshToggle(!refreshToggle);
            Swal.fire({
              title: "알림",
              text: "공지사항 삭제가 완료되었습니다.",
            });
          }
        })
        .catch((err) => {
          navigate("/pageerror");
        });
  }, [delNoticeNo]);

  const [noticeIsactive, setNoticeIsactive] = useState();

  useEffect(() => {
    noticeIsactive &&
      axios
        .patch(
          `${import.meta.env.VITE_BACK_SERVER}/admin/freeboard/notice/${
            noticeIsactive.noticeNo
          }/update`,
          noticeIsactive
        )
        .then((res) => {
          if (res.data === 1) {
            setRefreshToggle(!refreshToggle);
            Swal.fire({
              title: "알림",
              text: "공지사항이 활성화되었습니다.",
            });
          }
        })
        .catch((err) => {
          navigate("/pageerror");
        });
  }, [noticeIsactive]);
  const noticeAlert = () => {
    Swal.fire({
      title: `공지사항`,
      html: noticeValue,
      width: 800,
      confirmButtonText: "확인",
    });
  };
  return (
    <div className="admin-right freeBoard">
      <div className="admin-content-wrap">
        <div className="content">
          <div className="content_box">
            <div className="content_box_title">공지사항</div>
            <div className="editor-wrap">
              <ReactQuill
                theme="snow"
                value={noticeValue}
                onChange={setNoticeValue}
                modules={modules}
                formats={formats}
                placeholder="여기에 작성하세요"
              />
            </div>
            <div className="noticeBox">
              <div className="form-label">공지 게시판 선택</div>
              <select
                value={noticeTarget}
                onChange={(e) => setNoticeTarget(e.target.value)}
                className="notice-select"
              >
                <option value="1">자유 게시판</option>
                <option value="2">투표 게시판</option>
              </select>
              <button
                className="admin-btn"
                onClick={() => {
                  setNoticeSet({
                    memberNo: memberNo,
                    noticeContent: noticeValue,
                    noticeTarget: noticeTarget,
                  });
                }}
              >
                적용
              </button>
              <button
                className="admin-btn"
                onClick={() => {
                  setNoticeSet({
                    memberNo: memberNo,
                    noticeContent: noticeValue,
                    noticeTarget: noticeTarget,
                  });
                  noticeAlert(noticeValue);
                }}
              >
                미리보기
              </button>
            </div>
          </div>
          <div className="content_box">
            <div className="content_box_title">카테고리</div>
            <div className="cate-wrap">
              <div className="cate-left">
                <div className="section-title">미리보기</div>
                <div className="category-preview">
                  <FreeBoardSideMenuMap refreshToggle={refreshToggle} />
                </div>
              </div>
              <div className="cate-right">
                <div>
                  <div className="form-label">메인 카테고리</div>
                  <input
                    type="text"
                    value={categoryAddText}
                    onChange={(e) => {
                      setCategoryAddText(e.target.value);
                    }}
                  ></input>
                </div>
                <div>
                  <div className="form-label">서브 카테고리</div>
                  <input
                    type="text"
                    value={subCategoryAddText}
                    onChange={(e) => {
                      setSubCategoryAddText(e.target.value);
                    }}
                  ></input>
                  <button
                    className="admin-btn"
                    onClick={() => {
                      setInsertCate({
                        categoryAddText: categoryAddText,
                        subCategoryAddText: subCategoryAddText,
                        memberNo: memberNo,
                      });
                    }}
                  >
                    등록
                  </button>
                  <button
                    className="admin-btn"
                    onClick={() => {
                      setDeleteCate({
                        categoryAddText: categoryAddText,
                        subCategoryAddText: subCategoryAddText,
                        memberNo: memberNo,
                      });
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="admin-content-wrap">
        <div className="content-head">
          <div className="title m">공지사항</div>

          <div className="content-body">
            <table className="member-table freeBoard">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>내용</th>
                  <th>등록일</th>
                  <th>게시판</th>
                  <th>상태</th>
                  <th>회원 번호</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {noticeList &&
                  noticeList.map((notice, i) => {
                    return (
                      <tr key={"noticeList" + i}>
                        <td>{notice.noticeNo}</td>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(notice.noticeContent),
                          }}
                        ></td>
                        <td>{notice.noticeDate}</td>
                        <td>{notice.noticeTarget == 1 ? "자유" : "투표"}</td>
                        <td>
                          <select
                            defaultValue={notice.noticeIsactive}
                            onChange={(e) => {
                              setNoticeIsactive({
                                isActive: e.target.value,
                                noticeNo: notice.noticeNo,
                                memberNo: memberNo,
                              });
                            }}
                          >
                            <option value="TRUE">TRUE</option>
                            <option value="FALSE">FALSE</option>
                          </select>
                        </td>
                        <td>{notice.memberNo}</td>
                        <td>
                          <button
                            className="admin-btn"
                            onClick={() => {
                              setDelNoticeNo(notice.noticeNo);
                            }}
                          >
                            삭제하기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoticeContent = (props) => {
  const noticeValue = props.noticeValue;
  return <div dangerouslySetInnerHTML={{ __html: noticeValue }}></div>;
};

const confirm = (
  <div onClick={() => confirmData()} style={{ width: "100%", height: "100%" }}>
    확인
  </div>
);

export default ContentFreeBoard;
