import { useEffect, useState } from "react";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ImportExportOutlinedIcon from "@mui/icons-material/ImportExportOutlined";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./freeBoard.css";
import axios from "axios";
import PageNavigation from "../utils/PageNavigation";
import FreeBoardWrite from "./FreeBoardWrite";
import FreeBoardSideMenu from "../utils/FreeBoardSideMenu";
import { useRecoilState } from "recoil";
import { loginIdState, memberNoState } from "../utils/RecoilData";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import FreeBoardModify from "./FreeBoardModify";

const FreeBoardMain = () => {
  const [selectMenu, setSelectMenu] = useState([]);
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const navigate = useNavigate();
  const [selected, setSelected] = useState(-1);
  const [menus, setMenus] = useState([]);
  const [freeBoardTitle, setFreeBoardTitle] = useState("");
  const [member] = useRecoilState(loginIdState);
  const [reqPageInfo, setReqPageInfo] = useState({
    sideBtnCount: 3,
    pageNo: 1,
    listCnt: 10,
    order: 2,
  });
  const [totalListCount, setTotalListCount] = useState(0);
  const [freeBoardList, setFreeBoardList] = useState([]);
  const [titleState, setTitleState] = useState("");

  const addMenu = (menu) => {
    if (!selectMenu.includes(menu)) {
      setSelectMenu([...selectMenu, menu]);
    }
  };

  useEffect(() => {
    axios
      .get(`${backServer}/freeBoard/mainPage`)
      .then((res) => {
        setMenus(res.data);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, []);

  return (
    <div className="main-div">
      <div className="main-wrap">
        <FreeBoardSideMenu
          menus={menus}
          setMenus={setMenus}
          setSelectMenu={addMenu}
          setSelected={setSelected}
        />
        <div className="main-content">
          <div className="free-board">
            <div className="write-div">
              <div
                onClick={() => {
                  member === "" || member === null
                    ? Swal.fire({
                        title: "로그인",
                        text: "로그인 후 이용해주세요.",
                        icon: "warning",
                      }).then(() => {
                        navigate("/member/login");
                      })
                    : navigate("/freeBoard/boardWrite");
                }}
              >
                <span>글작성</span>
              </div>
            </div>
            <section className="section free-board">
              <Routes>
                <Route
                  path="content"
                  element={
                    <FreeBoardContent
                      selected={selected}
                      reqPageInfo={reqPageInfo}
                      setReqPageInfo={setReqPageInfo}
                      totalListCount={totalListCount}
                      setTotalListCount={setTotalListCount}
                      freeBoardList={freeBoardList}
                      setFreeBoardList={setFreeBoardList}
                      titleState={titleState}
                    />
                  }
                />
                <Route
                  path="boardWrite"
                  element={<FreeBoardWrite menus={menus} />}
                />
                <Route
                  path="modify/:freeBoardNo"
                  element={<FreeBoardModify menus={menus} />}
                />
              </Routes>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const FreeBoardContent = (props) => {
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const {
    selected,
    reqPageInfo,
    setReqPageInfo,
    totalListCount,
    setTotalListCount,
    freeBoardList,
    setFreeBoardList,
    titleState,
  } = props;
  const navigate = useNavigate();
  const [result, setResult] = useState(false);
  const [memberNo] = useRecoilState(memberNoState);
  const [toggle, setToggle] = useState(false);

  const nowDate = (dateString) => {
    const now = dayjs();
    const target = dayjs(dateString);
    const diffMinutes = now.diff(target, "minute");

    if (diffMinutes < 1) return "방금 전";
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}일 전`;
    return target.format("YYYY-MM-DD");
  };

  const listUrl =
    selected === -1
      ? `${backServer}/freeBoard/content?pageNo=${reqPageInfo.pageNo}&listCnt=${reqPageInfo.listCnt}&sideBtnCount=${reqPageInfo.sideBtnCount}&order=${reqPageInfo.order}`
      : `${backServer}/freeBoard/content/category?pageNo=${reqPageInfo.pageNo}&listCnt=${reqPageInfo.listCnt}&sideBtnCount=${reqPageInfo.sideBtnCount}&order=${reqPageInfo.order}&selected=${selected}`;

  const searchFreeBoardUrl = `${backServer}/freeBoard/content/freeBoardTitle?pageNo=${reqPageInfo.pageNo}&listCnt=${reqPageInfo.listCnt}&sideBtnCount=${reqPageInfo.sideBtnCount}&order=${reqPageInfo.order}&freeBoardTitle=${titleState}`;

  const boardUrl =
    titleState && titleState.trim() !== "" ? searchFreeBoardUrl : listUrl;

  useEffect(() => {
    axios
      .get(boardUrl)
      .then((res) => {
        if (res.data.boardList.length !== 0) {
          setFreeBoardList(res.data.boardList);
          setTotalListCount(res.data.totalListCount);
        } else {
          setFreeBoardList([]);
          setTotalListCount(0);
        }
      })
      .catch((err) => {
        setResult(true);
        navigate("/pageerror");
      });
  }, [reqPageInfo.order, reqPageInfo.pageNo, selected, titleState, toggle]);

  const handleBoardClick = (list) => {
    const detailUrl = memberNo
      ? `${backServer}/freeBoard/content/view?memberNo=${memberNo}&freeBoardNo=${list.freeBoardNo}&freeBoardCategoryNo=${list.freeBoardCategoryNo}&freeBoardSubcategoryNo=${list.freeBoardSubcategoryNo}`
      : `${backServer}/freeBoard/content/view?memberNo=0&freeBoardNo=${list.freeBoardNo}&freeBoardCategoryNo=${list.freeBoardCategoryNo}&freeBoardSubcategoryNo=${list.freeBoardSubcategoryNo}`;

    axios
      .get(detailUrl)
      .then((res) => {
        navigate(`/freeBoard/detail/${list.freeBoardNo}/${res.data.viewCount}`);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
    setToggle(!toggle);
  };

  return (
    <section className="freeBoard-section">
      {result ? (
        <div className="no-result">검색 결과가 없습니다.</div>
      ) : (
        <div className="board-div">
          {/* 카드 레이아웃 */}
          {freeBoardList.map((list, i) => (
            <div
              key={`board-${list.freeBoardNo}`}
              className="board-section"
              onClick={() => handleBoardClick(list)}
            >
              <div className="board-list-title">
                <div className="board-status">{list.freeBoardNo}</div>
                <div className="board-title">{list.freeBoardTitle}</div>
              </div>

              <div className="board-content">
                {list.freeBoardThumbnail ? (
                  <img src={list.freeBoardThumbnail} alt="thumbnail" />
                ) : (
                  <p>이미지 없음</p>
                )}
              </div>

              <div className="nickname-id">
                <span>{list.memberNickname}</span>
                <span>ㆍ</span>
                <span>{list.memberId}</span>
              </div>

              <div className="view-heart">
                <div className="view">
                  <VisibilityOutlinedIcon />
                  {list.viewCount}
                </div>
                <div className="heart">
                  <FavoriteBorderOutlinedIcon />
                  {list.likeCount}
                </div>
                <div className="hour">
                  <AccessTimeOutlinedIcon />
                  {nowDate(list.freeBoardDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="order-div">
        <div
          onClick={() => {
            setReqPageInfo({
              ...reqPageInfo,
              order: reqPageInfo.order === 2 ? 1 : 2,
            });
          }}
        >
          <ImportExportOutlinedIcon />
          {reqPageInfo.order === 2 ? (
            <span>최신순</span>
          ) : (
            <span>오래된순</span>
          )}
        </div>
      </div>

      <div className="page-navi">
        <PageNavigation
          reqPageInfo={reqPageInfo}
          setReqPageInfo={setReqPageInfo}
          totalListCount={totalListCount}
        />
      </div>
    </section>
  );
};

/**
 * 관리자 페이지용 컴포넌트
 */
const FreeBoardSideMenuMap = (props) => {
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const [selectMenu, setSelectMenu] = useState([]);
  const [selected, setSelected] = useState(-1);
  const [menus, setMenus] = useState([]);
  const toggle = props.refreshToggle;
  const navigate = useNavigate();

  const addMenu = (menu) => {
    if (!selectMenu.includes(menu)) {
      setSelectMenu([...selectMenu, menu]);
    }
  };

  useEffect(() => {
    axios
      .get(`${backServer}/freeBoard/mainPage`)
      .then((res) => {
        setMenus(res.data);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [toggle]);

  return (
    <FreeBoardSideMenu
      menus={menus}
      setMenus={setMenus}
      setSelectMenu={addMenu}
      setSelected={setSelected}
    />
  );
};

export { FreeBoardMain, FreeBoardSideMenuMap };
