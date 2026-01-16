import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SubtitlesOutlinedIcon from "@mui/icons-material/SubtitlesOutlined";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useRecoilState } from "recoil";
import { loginIdState, memberNoState } from "../utils/RecoilData";
import TextEditor from "../utils/TextEditor";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const FreeBoardModify = ({ menus }) => {
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const navigate = useNavigate();
  const { freeBoardNo } = useParams();
  const [memberId] = useRecoilState(loginIdState);
  const [memberNo] = useRecoilState(memberNoState);
  const [memberNickname, setMemberNickname] = useState("");
  const [freeBoardTitle, setFreeBoardTitle] = useState("");
  const [freeBoardContent, setFreeBoardContent] = useState("");
  const [cate, setCate] = useState("");
  const [subCate, setSubCate] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [freeBoardCategoryNo, setFreeBoardCategoryNo] = useState();
  const [freeBoardSubcategoryNo, setFreeBoardSubcategoryNo] = useState();
  const [freeBoardThumbnail, setFreeBoardThumbnail] = useState(null);
  const [freeBoardCategory, setFreeBoardCategory] = useState();
  const [freeBoardSubcategory, setFreeBoardSubcategory] = useState();

  useEffect(() => {
    axios
      .get(`${backServer}/member/${memberId}`)
      .then((res) => {
        setMemberNickname(res.data.memberNickname);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [memberId]);

  useEffect(() => {
    axios
      .get(`${backServer}/freeBoard/modify`, { params: { freeBoardNo } })
      .then((res) => {
        setFreeBoardTitle(res.data.freeBoardTitle);
        setFreeBoardContent(res.data.freeBoardContent);
        setFreeBoardCategoryNo(res.data.freeBoardCategoryNo);
        setFreeBoardSubcategoryNo(res.data.freeBoardSubcategoryNo);
        setFreeBoardThumbnail(res.data.freeBoardThumbnail);

        return axios.get(`${backServer}/freeBoard/modify/cate`, {
          params: {
            freeBoardSubcategoryNo: res.data.freeBoardSubcategoryNo,
            freeBoardCategoryNo: res.data.freeBoardCategoryNo,
          },
        });
      })
      .then((res) => {
        setFreeBoardCategory(res.data.freeBoardCategory);
        setFreeBoardSubcategory(res.data.freeBoardSubcategory);
        setCate(res.data.freeBoardCategory);
        setSelectedSub(res.data.freeBoardSubcategory);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [freeBoardNo]);

  useEffect(() => {
    if (!freeBoardCategory) return;

    axios
      .get(`${backServer}/freeBoard/boardWrite`, {
        params: { freeBoardCategory },
      })
      .then((res) => {
        setSubCate(res.data);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [freeBoardCategory]);

  const handleChange = (e) => {
    setCate(e.target.value);
    setFreeBoardCategory(e.target.value);
    setSelectedSub("");
  };

  const subHandleChange = (e) => {
    const selected = subCate.find(
      (sub) => sub.freeBoardSubcategory === e.target.value
    );
    setSelectedSub(e.target.value);

    if (selected) {
      setFreeBoardCategoryNo(selected.freeBoardCategoryNo);
      setFreeBoardSubcategoryNo(selected.freeBoardSubcategoryNo);
    }
  };

  const modifyFreeBoard = () => {
    if (!freeBoardCategoryNo || !freeBoardSubcategoryNo) {
      Swal.fire({
        title: "카테고리",
        text: "카테고리를 선택해주세요.",
        icon: "warning",
      });
      return;
    }
    if (!freeBoardTitle.trim()) {
      Swal.fire({
        title: "제목 입력",
        text: "제목을 입력해주세요.",
        icon: "warning",
      });
      return;
    }
    if (!freeBoardContent.trim()) {
      Swal.fire({
        title: "내용 입력",
        text: "내용을 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("freeBoardCategoryNo", freeBoardCategoryNo);
    formData.append("freeBoardSubcategoryNo", freeBoardSubcategoryNo);
    formData.append("freeBoardTitle", freeBoardTitle);
    formData.append("memberNo", memberNo);
    formData.append("freeBoardContent", freeBoardContent);
    formData.append("freeBoardNo", freeBoardNo);

    if (freeBoardThumbnail) {
      formData.append("freeBoardThumbnail", freeBoardThumbnail);
    } else {
      axios
        .patch(`${backServer}/freeBoard/image/${freeBoardNo}`)
        .catch((err) => console.error(err));
    }

    axios
      .patch(`${backServer}/freeBoard/modify/fix`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data === 1) {
          navigate("/freeBoard/content");
        }
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  };

  const cancelWrite = () => {
    Swal.fire({
      title: "취소",
      text: "취소하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then((confirm) => {
      if (confirm.isConfirmed) {
        navigate("/freeBoard/content");
      }
    });
  };

  return (
    <div className="write-wrap">
      <div className="nickname section-area">
        <div className="text-area">
          <div>
            <DriveFileRenameOutlineOutlinedIcon />
            <span>닉네임</span>
          </div>
          <div className="nickname-text">
            <span>{memberNickname}</span>
          </div>
        </div>
      </div>

      <div className="category-select section-area">
        <div className="category-area">
          <div>
            <CategoryOutlinedIcon />
            <span>카테고리</span>
          </div>
          <div className="category-text">
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select sx={{ height: 40 }} value={cate} onChange={handleChange}>
                {menus.map((menu, i) => (
                  <MenuItem key={`menu-${i}`} value={menu.freeBoardCategory}>
                    {menu.freeBoardCategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {cate && (
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  sx={{ height: 40 }}
                  value={selectedSub}
                  onChange={subHandleChange}
                >
                  {subCate.map((sub, i) => (
                    <MenuItem key={`sub-${i}`} value={sub.freeBoardSubcategory}>
                      {sub.freeBoardSubcategory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </div>
      </div>

      <div className="write-title section-area">
        <div className="title-area">
          <div>
            <SubtitlesOutlinedIcon />
            <span>제 목</span>
          </div>
          <div className="title-text">
            <input
              type="text"
              value={freeBoardTitle}
              placeholder="제목 입력"
              onChange={(e) => setFreeBoardTitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="content-write">
        <div>
          <ContentPasteOutlinedIcon />
          <span>내 용</span>
        </div>
        <div className="content-area">
          <div className="content-editor">
            <TextEditor
              setData={setFreeBoardContent}
              data={freeBoardContent}
              setFreeBoardThumbnail={setFreeBoardThumbnail}
            />
          </div>
        </div>
      </div>

      <div className="submit-section">
        <div className="write-button">
          <button className="submit-btn" onClick={modifyFreeBoard}>
            수정하기
          </button>
        </div>
        <div className="cancel-button">
          <button className="cancel-btn" onClick={cancelWrite}>
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeBoardModify;
