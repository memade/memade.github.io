const apiPaths = ["sdk_init"];

(function () {
  let loadedCount = 0;
  let totalCount = apiPaths.length;

  console.log(`开始加载 ${totalCount} 个API配置...`);

  apiPaths.forEach(function (apiPath) {
    const script = document.createElement("script");
    script.src = `sdks/${apiPath}/api.js`;
    script.onload = function () {
      loadedCount++;
      if (loadedCount === totalCount) {
        console.log(
          `✓ 所有API加载完成！共 ${window.APIRegistry.getAll().length} 个接口`
        );
      }
    };
    script.onerror = function () {
      console.error(`✗ 加载失败: sdks/${apiPath}/api.js`);
    };
    document.head.appendChild(script);
  });
})();
