import { ref, onMounted, watch } from 'https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.esm-browser.prod.js';

export function useFetchData() {
  const categories = ref([]);            // 產品頁的 tab 清單
  const currentCategory = ref('');       // 當前 tab 名稱
  const projects = ref([]);              // 當前 tab 的作品清單
  const path = ref('');                  // 圖片路徑
  const isTabLoading = ref(false);       // loading 狀態

  const homeData = ref([]);              // 首頁的 products 資料
  const tabMap = ref({});                // id 對應顯示名稱的 map

  const apiKey = 'AIzaSyB4qtRfCPfBRvf8l5mzJX1LZgmfzePn_-U';
  const sheetId = '1RcmJvj-N-dFnbpNhUwoaCoJpPLHQOWad2CkafV_AhzM';
  const cache = new Map();

  // ✅ 讀取首頁表單
  const fetchHomeData = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/home!A1:Z?key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const values = data.values;
      if (!values || values.length < 2) return;

      const headers = values[0];
      const rows = values.slice(1);
      const parsed = rows.map((row) => {
        const obj = {};
        headers.forEach((key, i) => {
          obj[key] = row[i]?.trim() || '';
        });
        return obj;
      });

      homeData.value = parsed;

      // 建立 tab 名稱對應表
      const map = {};
      parsed.forEach((item) => {
        if (item.products_id && item.products_title) {
          map[item.products_id] = item.products_title;
        }
      });
      tabMap.value = map;
    } catch (err) {
      console.error('🚨 無法載入首頁資料:', err);
    }
  };

  // ✅ 取得所有工作表名稱，並排除 home，只保留有效的 tab
  const fetchSheetNames = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const sheetNames = data.sheets.map((s) => s.properties.title).filter(name => name !== 'home');

      // 若 homeData 有順序，照它排序 tab
      if (homeData.value.length > 0) {
        const ids = homeData.value.map(i => i.products_id).filter(id => sheetNames.includes(id));
        categories.value = ids;
      } else {
        categories.value = sheetNames;
      }

      const hash = decodeURIComponent(window.location.hash.replace('#', ''));
      currentCategory.value = sheetNames.includes(hash) ? hash : categories.value[0] || '';
    } catch (err) {
      console.error('🚨 無法取得工作表清單:', err);
    }
  };

  const convertGoogleDriveUrl = (url) => {
    const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view.*/);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
  };

  const fetchSheetData = async (sheetName) => {
    if (cache.has(sheetName)) {
      console.log(`📦 從 cache 載入 ${sheetName}`);
      projects.value = cache.get(sheetName);
      const found = projects.value.find((p) => p.path);
      path.value = found?.path || '';
      return;
    }

    const range = `'${sheetName}'!A1:Z`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const values = data.values;
      if (!values || values.length === 0) {
        projects.value = [];
        return;
      }

      const headers = values[0];
      const rows = values.slice(1);
      const parsed = rows.map((row) => {
        const obj = {};
        headers.forEach((key, i) => {
          obj[key] = row[i]?.trim() || '';
        });

        obj.responsibilities = obj.responsibilities
          ? obj.responsibilities.split('、').filter((r) => r.trim() !== '')
          : [];

        return obj;
      });

      cache.set(sheetName, parsed);
      projects.value = parsed;
      const found = parsed.find((p) => p.path);
      path.value = found?.path || '';
    } catch (err) {
      console.error('🚨 資料載入失敗:', err);
    }
  };

  onMounted(async () => {
    await fetchHomeData();                     // 👈 抓首頁的資料（tabMap 也會生成）
    await fetchSheetNames();                   // 👈 再抓產品頁的分類（用 tabMap 決定排序）
    await fetchSheetData(currentCategory.value);
  });

  watch(currentCategory, async (newSheet) => {
    isTabLoading.value = true;
    await fetchSheetData(newSheet);
    isTabLoading.value = false;
  });

  return {
    categories,
    currentCategory,
    projects,
    path,
    isTabLoading,
    fetchData: fetchSheetNames,
    homeData,
    tabMap,
    fetchHomeData,
  };
}