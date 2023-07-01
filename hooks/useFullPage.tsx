import React from 'react';

export interface PageList<T = any> {
  pageNum: number;
  background: string;
  component: (arg: T) => React.JSX.Element;
}

const useFullPage = (pageList: PageList[]) => {
  const [windowObj, setWindowObj] = React.useState<Window>();
  const [currentPageNum, setCurrentPageNum] = React.useState(1);
  const totalPageLen = pageList.length;
  const pageRefList = React.useRef<HTMLDivElement[]>([]);
  const [isExecuting, setIsExecuting] = React.useState(false);

  React.useEffect(() => {
    if (window !== undefined) setWindowObj(window);
  }, []);

  const currentPageChange = React.useCallback(
    (event: Event) => {
      let scroll = windowObj?.scrollY!;
      for (let i = 1; i <= totalPageLen; i++) {
        if (
          scroll >
            pageRefList.current[i].offsetTop - windowObj!.outerHeight / 3 &&
          scroll <
            pageRefList.current[i].offsetTop -
              windowObj!.outerHeight / 3 +
              pageRefList.current[i].offsetHeight
        ) {
          setCurrentPageNum(i);
          break;
        }
      }
    },
    [totalPageLen, windowObj],
  );

  const pageButtonHandler = (pageNum: number) => {
    windowObj?.scrollTo({
      top: pageRefList.current[pageNum].offsetTop,
      behavior: 'smooth',
    });
  };

  const wheelHandler = React.useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      if (!isExecuting) {
        setIsExecuting(true);

        if (event.deltaY < 0 && currentPageNum > 1) {
          windowObj?.scrollTo({
            top: pageRefList.current[currentPageNum - 1].offsetTop,
            behavior: 'smooth',
          });
        }

        if (event.deltaY > 0 && currentPageNum < totalPageLen) {
          windowObj?.scrollTo({
            top: pageRefList.current[currentPageNum + 1].offsetTop,
            behavior: 'smooth',
          });
          setCurrentPageNum((state) => state + 1);
        }
      }

      setTimeout(() => {
        setIsExecuting(false);
      }, 600);
    },
    [currentPageNum, isExecuting, totalPageLen, windowObj],
  );

  React.useEffect(() => {
    windowObj?.addEventListener('scroll', currentPageChange);
    return () => {
      windowObj?.removeEventListener('scroll', currentPageChange);
    };
  }, [currentPageChange, windowObj]);

  React.useEffect(() => {
    windowObj?.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      windowObj?.removeEventListener('wheel', wheelHandler);
    };
  }, [wheelHandler, windowObj]);

  return {
    pageButtonHandler,
    currentPageNum,
    pageRefList,
  };
};

export default useFullPage;
