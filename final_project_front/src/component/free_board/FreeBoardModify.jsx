import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SubtitlesOutlinedIcon from "@mui/icons-material/SubtitlesOutlined";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { loginIdState, memberNoState } from "../utils/RecoilData";
import { useRecoilState } from "recoil";
import TextEditor from "../utils/TextEditor";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const FreeBoardModify = (props) => {
  const [memberId] = useRecoilState(loginIdState);
  const [memberNo] = useRecoilState(memberNoState);
  const [memberNickname, setMemberNickname] = useState("");
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const [freeBoardTitle, setFreeBoardTitle] = useState("");
  const [freeBoardContent, setFreeBoardContent] = useState("");
  const [cate, setCate] = useState("");
  const [subCate, setSubCate] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [freeBoardCategoryNo, setFreeBoardCategoryNo] = useState();
  const [freeBoardSubcategoryNo, setFreeBoardSubcategoryNo] = useState();
  const [freeBoardThumbnail, setFreeBoardThumbnail] = useState(null);
  const [freeBoardSubcategory, setFreeBoardSubcategory] = useState();
  const [freeBoardCategory, setFreeBoardCategory] = useState();

  const navigate = useNavigate();
  const menus = props.menus;
  const param = useParams();
  const freeBoardNo = param.freeBoardNo;

  useEffect(() => {
    axios
      .get(`${backServer}/freeBoard/modify/thumb?freeBoardNo=${freeBoardNo}`)
      .then((res) => {
        setFreeBoardThumbnail(res.data.freeBoardThumbnail);
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  }, [freeBoardNo]);

  useEffect(() => {
    axios
      .get(`${backServer}/freeBoard/modify?freeBoardNo=${freeBoardNo}`)
      .then((res1) => {
        setFreeBoardTitle(res1.data.freeBoardTitle);
        setFreeBoardContent(res1.data.freeBoardContent);
        setFreeBoardCategoryNo(res1.data.freeBoardCategoryNo);
        setFreeBoardSubcategoryNo(res1.data.freeBoardSubcategoryNo);
        setFreeBoardThumbnail(res1.data.freeBoardThumbnail);
        axios
          .get(
            `${backServer}/freeBoard/modify/cate?freeBoardSubcategoryNo=${res1.data.freeBoardSubcategoryNo}&freeBoardCategoryNo=${res1.data.freeBoardCategoryNo}`
          )
          .then((res2) => {
            setFreeBoardCategory(res2.data.freeBoardCategory);
            setFreeBoardSubcategory(res2.data.freeBoardSubcategory);
          })
          .catch((err2) => {
            console.log(err2);
          });
      })
      .catch((err1) => {
        console.log(err1);
      });
  }, [freeBoardCategory, freeBoardSubcategory]);

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
    if (freeBoardCategory) {
      axios
        .get(
          `${backServer}/freeBoard/boardWrite?freeBoardCategory=${freeBoardCategory}`
        )
        .then((res) => {
          setSubCate(res.data);
        })
        .catch((err) => {
          navigate("/pageerror");
        });
    }
  }, [freeBoardCategory]);

  const handleChange = (e) => {
    setCate(e.target.value);
    setFreeBoardCategory(e.target.value);
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

    if (freeBoardThumbnail !== null) {
      formData.append("freeBoardThumbnail", freeBoardThumbnail);
    } else {
      axios
        .patch(`${backServer}/freeBoard/image/${freeBoardNo}`)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          navigate("/pageerror");
        });
    }

    axios
      .patch(`${backServer}/freeBoard/modify/fix`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data === 1) {
          Swal.fire({
            title: "수정 완료",
            text: "게시글이 수정되었습니다.",
            icon: "success",
          }).then(() => {
            navigate("/freeBoard/content");
          });
        }
      })
      .catch((err) => {
        navigate("/pageerror");
      });
  };

  const cancelWrite = () => {
    Swal.fire({
      title: "취소",
      text: "수정을 취소하시겠습니까?",
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
    <div className="write-wrap modify-wrap">
      <div className="write-header">
        <h2>📝 게시글 수정</h2>
        <p className="write-subtitle">내용을 수정해주세요</p>
      </div>

      <div className="write-form">
        {/* 작성자 정보 */}
        <div className="form-row">
          <label className="form-label">
            <DriveFileRenameOutlineOutlinedIcon className="label-icon" />
            작성자
          </label>
          <div className="form-value">
            <span className="author-name">{memberNickname}</span>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div className="form-row">
          <label className="form-label">
            <CategoryOutlinedIcon className="label-icon" />
            카테고리
          </label>
          <div className="form-input category-select-group">
            <FormControl className="category-select">
              <Select
                value={freeBoardCategory || ""}
                onChange={handleChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <span className="placeholder">카테고리 선택</span>;
                  }
                  return selected;
                }}
              >
                {menus.map((menu, i) => (
                  <MenuItem key={`menu-${i}`} value={menu.freeBoardCategory}>
                    {menu.freeBoardCategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {freeBoardCategory && (
              <FormControl className="category-select">
                <Select
                  value={freeBoardSubcategory || ""}
                  onChange={subHandleChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span className="placeholder">세부 카테고리</span>;
                    }
                    return selected;
                  }}
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

        {/* 제목 */}
        <div className="form-row">
          <label className="form-label">
            <SubtitlesOutlinedIcon className="label-icon" />
            제목
          </label>
          <div className="form-input">
            <input
              type="text"
              className="title-input"
              value={freeBoardTitle}
              placeholder="제목을 입력하세요"
              onChange={(e) => setFreeBoardTitle(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        {/* 내용 */}
        <div className="form-row editor-row">
          <label className="form-label">
            <ContentPasteOutlinedIcon className="label-icon" />
            내용
          </label>
          <div className="form-input editor-wrapper">
            <TextEditor
              setData={setFreeBoardContent}
              data={freeBoardContent}
              setFreeBoardThumbnail={setFreeBoardThumbnail}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="form-actions">
          <button className="btn-cancel" onClick={cancelWrite}>
            취소
          </button>
          <button className="btn-submit" onClick={modifyFreeBoard}>
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeBoardModify;
