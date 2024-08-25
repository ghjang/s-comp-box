import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";

export function downloadMidiFile(node, params) {
  let { abcjs, visualObj, abcjsEditor } = params;

  const handleClick = () => {
    if (!abcjs) {
      throw new Error("abcjs is not defined");
    }

    if (!visualObj) {
      visualObj = abcjsEditor?.tunes;
    }

    if (!visualObj || visualObj.length === 0) {
      throw new Error("visualObj is not defined");
    }

    // midiOutputType
    //   - link: 'encoded'된 데이터를 'href' 속성으로 설정한 'a' 태그를 포함하는 HTML 부분 텍스트 (기본값)
    //   - encoded: 'data:audio/midi' 형태의 'data protocol scheme'을 사용한 형태로 인코딩
    //   - binary: 'Uint8Array' 형태의 이진 데이터로 인코딩
    const midiData = abcjs.synth.getMidiFile(visualObj[0], {
      midiOutputType: "binary",
    });

    const blob = new Blob([midiData], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sheet-music.mid";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  node.addEventListener("click", handleClick);

  return {
    update(newParams) {
      ({ abcjs, visualObj, abcjsEditor } = newParams);
    },

    destroy() {
      node.removeEventListener("click", handleClick);
    },
  };
}

export function downloadPdfFile(node, params) {
  let { abcjs, visualObj, abcjsEditor, scaleFactor, rasterize, saveFileName } =
    params;

  scaleFactor = scaleFactor || 2; // PDF내에 저장되는 이미지의 해상도 조정을 위한 배율
  rasterize = rasterize === undefined ? true : rasterize;
  saveFileName = saveFileName || "sheet-music.pdf";

  const handleClick = () => {
    if (!abcjs) {
      throw new Error("abcjs is not defined");
    }

    if (!visualObj) {
      visualObj = abcjsEditor?.tunes;
    }

    if (!visualObj || visualObj.length === 0) {
      throw new Error("visualObj is not defined");
    }

    const svg =
      visualObj[0].svg || node.closest(".abcrun-box")?.querySelector("svg");

    if (!(svg instanceof Node)) {
      throw new Error("svg is not a Node");
    }

    // PDF 페이지 크기 설정 (A4 크기 예시)
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    const pdf = new jsPDF("portrait", "mm", "a4");
    const svgWidth = svg.getBoundingClientRect().width;
    const svgHeight = svg.getBoundingClientRect().height;

    // 이미지 크기를 PDF 페이지 크기에 맞추기 위해 비율 계산
    const widthRatio = pdfWidth / svgWidth;
    const heightRatio = pdfHeight / svgHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    // 이미지 크기 조정
    const imgWidth = svgWidth * ratio;
    const imgHeight = svgHeight * ratio;

    if (rasterize) {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = svgWidth * scaleFactor;
        canvas.height = svgHeight * scaleFactor;

        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(img, 0, 0);

        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          imgWidth,
          imgHeight
        );
        pdf.save(saveFileName);
      };

      let svgData = new XMLSerializer().serializeToString(svg);
      svgData = unescape(encodeURIComponent(svgData));
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } else {
      const svgClone = svg.cloneNode(true);
      svgClone.setAttribute("width", imgWidth);
      svgClone.setAttribute("height", imgHeight);

      // FIXME: '잘못된 스타일' 삽입
      //
      // 아래의 방법은 정상적으로 해당 SVG와 관련된 스타일을 삽입하지 못한다.
      // 결과적으로 '백지' PDF가 출력된다. 개발자 도구에서 스타일 삽입후의
      // 'svgClone' 데이터를 텍스트로 '.svg'에 저장해서 살펴보면 스타일이
      // 문제인 것으로 일단 보인다.
      const style = document.createElement("style");
      style.textContent = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("");
          } catch (e) {
            console.warn("Could not read the stylesheet:", styleSheet.href);
            return "";
          }
        })
        .join("");
      svgClone.insertBefore(style, svgClone.firstChild);

      svg2pdf(svgClone, pdf, {
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
      }).then(() => {
        pdf.save(saveFileName);
      });
    }
  };

  node.addEventListener("click", handleClick);

  return {
    update(newParams) {
      ({ abcjs, visualObj, abcjsEditor, scaleFactor, rasterize, saveFileName } =
        newParams);
      scaleFactor = scaleFactor || 2;
      rasterize = rasterize === undefined ? true : rasterize;
      saveFileName = saveFileName || "sheet-music.pdf";
    },

    destroy() {
      node.removeEventListener("click", handleClick);
    },
  };
}
