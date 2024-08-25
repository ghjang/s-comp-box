// 'element'로부터 가장 가까운 'className'을 가진 엘리먼트를 찾아 반환한다.
// 'Shadow DOM'내에 element가 있을 경우에 'Shadow DOM' 위로 올라가서 찾는다.
// 참고로 'closest' 메소드는 'Shadow DOM'을 벗어나지 않는다.
export function findClosest(element, className) {
  if (!element) return null;
  if (element.classList && element.classList.contains(className)) {
    return element;
  }
  if (element.parentElement) {
    return findClosest(element.parentElement, className);
  }
  if (element.getRootNode && element.getRootNode().host) {
    return findClosest(element.getRootNode().host, className);
  }
  return null;
}

export function findClosestAncestor(element, className) {
  let parent = element.parentElement;
  if (!parent) {
    parent = element.getRootNode?.().host;
  }
  if (!parent) {
    return null;
  }
  return findClosest(parent, className);
}
