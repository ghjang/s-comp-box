export function downloadMidiFile(node, params) {
    let { abcjs, visualObj } = params;

    const handleClick = () => {
        if (!abcjs) {
            throw new Error("abcjs is not defined");
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

    node.addEventListener('click', handleClick);

    return {
        update(newParams) {
            ({ abcjs, visualObj } = newParams);
        },

        destroy() {
            node.removeEventListener('click', handleClick);
        }
    };
}