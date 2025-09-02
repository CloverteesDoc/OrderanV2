// Daftar Harga
    const hargaPerPcs = [
      { min: 72, harga: 88000 },
      { min: 36, harga: 94000 },
      { min: 12, harga: 99000 },
      { min: 3, harga: 104000 },
      { min: 2, harga: 110000 },
      { min: 1, harga: 138000 }
    ];
    const hargaPerJenisProduk = {
      kaos: [
        { min: 72, harga: 88000 },
        { min: 36, harga: 94000 },
        { min: 12, harga: 99000 },
        { min: 3, harga: 104000 },
        { min: 2, harga: 110000 },
        { min: 1, harga: 138000 }
      ],
      dress: [
        { min: 72, harga: 105000 },
        { min: 36, harga: 110000 },
        { min: 12, harga: 115000 },
        { min: 3, harga: 120000 },
        { min: 2, harga: 125000 },
        { min: 1, harga: 150000 }
      ]
    };

    // size dress
    const ukuranValidDress = {
      dewasa: ["S", "M", "L", "XL"],
      anak: ["S", "M", "L"]
    };

    // Tambahan harga ukuran besar
    const tambahanUkuran = {
      "2XL": 8000,
      "3XL": 13000
    };

    const tambahanJenisProduk = {
      lengan_panjang: 10000 // ikut harga kaos + 10rb/pcs
    };
    
    // Variabel global untuk total harga semua
    let hargaTotalSemua = 0;

    // Variabel global untuk menyimpan rincian harga HTML
    let rincianHargaLengkapHTML = "";

    // Daftar Warna Tersedia
    let warnaIndex = 0;

    const fileListMap = {};

    const warnaList = [
      "BLACK", "WHITE", "SOFT PINK", "NEON PINK", "RED", "MAROON", "LILAC", 
      "SKY BLUE", "ROYAL BLUE", "NAVY BLUE", "NEON YELLOW", "TOSCA", 
      "GREEN", "FOREST GREEN", "YELLOW", "ORANGE", "MUSTARD"
    ];
    
    const warnaPerJenisProduk = {
    "kaos": ["BLACK", "WHITE", "SOFT PINK", "NEON PINK", "RED", "MAROON", "LILAC", 
           "SKY BLUE", "ROYAL BLUE", "NAVY BLUE", "NEON YELLOW", "TOSCA", 
           "GREEN", "FOREST GREEN", "YELLOW", "ORANGE", "MUSTARD"],

    "dress": ["BLACK", "WHITE", "RED", "YELLOW"],

    "lengan_panjang": ["BLACK", "WHITE", "SOFT PINK", "RED", "MAROON", "SKY BLUE",
           "ROYAL BLUE", "NAVY BLUE", "NEON YELLOW", "TOSCA", "GREEN", "FOREST GREEN",
           "YELLOW", "MUSTARD"]
    };

    // Format Rupiah
    function formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(angka);
    }

    // Hitung Total Harga
    function hitungHargaTotal() {
  const sections = document.querySelectorAll('.warna-section');
  const hargaDiv = document.getElementById('rincianHarga');

  const dataPerJenis = {};
  let grandTotal = 0;

  sections.forEach((section, index) => {
    const jenisSelect = section.querySelector(`select[name="jenisProduk_${index + 1}"]`);
    const jenis = jenisSelect?.value || "kaos";

    const warnaSelect = section.querySelector(`select[name="warna${index + 1}"]`);
    const warna = warnaSelect?.value || `Warna #${index + 1}`;

    const dewasaInputs = section.querySelectorAll('input[name^="dewasa_"]');
    const anakInputs = section.querySelectorAll('input[name^="anak_"]');

    const warnaObj = { warna, dewasa: {}, anak: {} };
    let totalQty = 0;

    dewasaInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const size = input.name.split('_')[2];
        warnaObj.dewasa[size] = (warnaObj.dewasa[size] || 0) + qty;
        totalQty += qty;
      }
    });

    anakInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const size = input.name.split('_')[2];
        warnaObj.anak[size] = (warnaObj.anak[size] || 0) + qty;
        totalQty += qty;
      }
    });

    if (!dataPerJenis[jenis]) {
      dataPerJenis[jenis] = {
        warnaList: [],
        totalQty: 0,
        tambahan: { "2XL": 0, "3XL": 0 },
        totalTambahanHarga: 0,
        totalHargaDasar: 0
      };
    }

    dataPerJenis[jenis].warnaList.push(warnaObj);
    dataPerJenis[jenis].totalQty += totalQty;

    // Tambahan ukuran besar
    for (let ukuran of ["2XL", "3XL"]) {
      if (warnaObj.dewasa[ukuran]) {
        dataPerJenis[jenis].tambahan[ukuran] += warnaObj.dewasa[ukuran];
      }
    }
  });

  let output = '';
  let counter = 1;

  for (let [jenis, data] of Object.entries(dataPerJenis)) {
      if (data.totalQty === 0) continue; // ⛔ skip jika belum ada qty sama sekali

    const totalQty = data.totalQty;
    const hargaTiers = hargaPerJenisProduk[jenis] || hargaPerJenisProduk["kaos"];
    const hargaDasar = hargaTiers.find(h => totalQty >= h.min)?.harga || 0;
    const tambahanPerPcs = tambahanJenisProduk[jenis] || 0;

    const hargaFinal = hargaDasar + tambahanPerPcs;
    const subTotal = hargaFinal * totalQty;

    let tambahanRincian = '';
    let totalTambahan = 0;

    for (let [ukuran, qty] of Object.entries(data.tambahan)) {
      if (qty > 0 && tambahanUkuran[ukuran]) {
        const biaya = tambahanUkuran[ukuran] * qty;
        totalTambahan += biaya;
        tambahanRincian += `Tambahan ${ukuran}: ${formatRupiah(tambahanUkuran[ukuran])} × ${qty} = ${formatRupiah(biaya)}\n`;
      }
    }

    // ❗ Jangan tampilkan baris tambahan produk jika jenis = lengan_panjang
      if (tambahanPerPcs > 0 && jenis !== "lengan_panjang") {
        const biaya = tambahanPerPcs * totalQty;
        totalTambahan += biaya;
        tambahanRincian += `Tambahan Produk (${jenis}): ${formatRupiah(tambahanPerPcs)} × ${totalQty} = ${formatRupiah(biaya)}\n`;
      }

    const totalSub = subTotal + totalTambahan;
    grandTotal += totalSub;

    output += `${counter++}. ${jenis.toUpperCase()}\n`;

    data.warnaList.forEach(w => {
      output += `${w.warna}\n`;

      const dewasaKeys = Object.keys(w.dewasa);
      if (dewasaKeys.length) {
        output += `Dewasa: ${dewasaKeys.map(s => `${s} (${w.dewasa[s]})`).join(', ')}\n`;
      }

      const anakKeys = Object.keys(w.anak);
      if (anakKeys.length) {
        output += `Anak-anak: ${anakKeys.map(s => `${s} (${w.anak[s]})`).join(', ')}\n`;
      }

      output += `\n`;
    });

    output += `Total Harga: ${formatRupiah(hargaFinal)} × ${totalQty} = ${formatRupiah(subTotal)}\n`;
    if (tambahanRincian) output += `${tambahanRincian}`;
    output += `Total Sub: ${formatRupiah(totalSub)}\n`;
  }

  rincianHargaLengkapHTML = `<div style="white-space: pre-wrap; border-radius: 8px; padding: 16px; font-size: 15px; font-family: 'Roboto', sans-serif; line-height: 1.6; color: #222;">${output.trim()}</div>`;

  hargaTotalSemua = grandTotal;

hargaDiv.innerHTML = rincianHargaLengkapHTML;

document.getElementById("totalHargaAkhir").innerHTML = `
  <div style="font-size: 16px; font-family: 'Roboto', sans-serif; font-weight: bold; padding: 10px;">
    TOTAL SEMUA:
  <div style="font-size: 30px; font-family: 'Roboto', sans-serif; font-weight: bold; padding: 1px;">
    ${formatRupiah(grandTotal)}
  </div></div>
`;


}

    // Tambah Form Warna Baru
    function tambahWarna() {
  warnaIndex++;
  const container = document.getElementById('warnaContainer');
  const section = document.createElement('div');
  section.className = 'warna-section';
  section.id = `warna-${warnaIndex}`;

  section.innerHTML = `
    <select name="jenisProduk_${warnaIndex}" class="jenis-produk" onchange="updateWarnaOptions(${warnaIndex})" required>
      <option value="">-- Pilih Produk --</option>
      <option value="kaos">Kaos ( Standard )</option>
      <option value="lengan_panjang">Kaos Lengan Panjang (+Rp10.000)</option>
      <option value="dress">Dress</option>
      
    </select>

    <div class="header-warna">
      <label>Warna #${warnaIndex}</label>
      <button type="button" class="delete-btn" onclick="hapusWarna('warna-${warnaIndex}')">
        ✕ Hapus Warna
      </button>
    </div>

    <select name="warna${warnaIndex}" onchange="updateTotal()" style="display: none;" disabled>
      <option value="">-- Pilih Warna --</option>
      ${warnaList.map(warna => `<option value="${warna}">${warna}</option>`).join('')}
    </select>

    <!-- 🔵 TABEL UKURAN NORMAL (default aktif) -->
<div class="table-container ukuran-normal">
  <h4>Ukuran Dewasa</h4>
  <table>
    <tr>
      <th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>2XL</th><th>3XL</th>
    </tr>
    <tr>
      ${['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(ukuran => `
        <td><input type="number" name="dewasa_${warnaIndex}_${ukuran}" 
               min="0" value="0" oninput="updateTotal()"></td>
      `).join('')}
    </tr>
  </table>

  <h4>Ukuran Anak</h4>
  <table>
    <tr>
      <th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th>
    </tr>
    <tr>
      ${['XS', 'S', 'M', 'L', 'XL'].map(ukuran => `
        <td><input type="number" name="anak_${warnaIndex}_${ukuran}" 
               min="0" value="0" oninput="updateTotal()"></td>
      `).join('')}
    </tr>
  </table>
</div>

<!-- 🟣 TABEL KHUSUS DRESS (default sembunyi) -->
<div class="table-container ukuran-dress" style="display: none;">
  <h4>Ukuran Dewasa (Dress)</h4>
  <table>
    <tr>
      <th>S</th><th>M</th><th>L</th><th>XL</th>
    </tr>
    <tr>
      ${['S', 'M', 'L', 'XL'].map(ukuran => `
        <td><input type="number" name="dewasa_${warnaIndex}_${ukuran}_dress" 
               min="0" value="0" oninput="updateTotal()"></td>
      `).join('')}
    </tr>
  </table>

  <h4>Ukuran Anak (Dress)</h4>
  <table>
    <tr>
      <th>S</th><th>M</th><th>L</th>
    </tr>
    <tr>
      ${['S', 'M', 'L'].map(ukuran => `
        <td><input type="number" name="anak_${warnaIndex}_${ukuran}_dress" 
               min="0" value="0" oninput="updateTotal()"></td>
      `).join('')}
    </tr>
  </table>
</div>

    <div class="desain-section">
      <h4>🎨 Perincian Desain</h4>
  
      <label>Desain Depan</label>
      <textarea name="desain_depan_${warnaIndex}" placeholder="Contoh: Logo depan ukuran 10x10cm, warna merah"></textarea>
        
      <label>Desain Belakang</label>
      <textarea name="desain_belakang_${warnaIndex}" placeholder="Contoh: Tulisan 'Clovertees' dengan font Arial"></textarea>
        
      <label>Desain Lengan (jika ada)</label>
      <textarea name="desain_lengan_${warnaIndex}" placeholder="Contoh: Strip horizontal 2cm dari ujung lengan"></textarea>
    </div>

    <div class="file-upload-container">
  <label>Upload Desain (warna ini)</label>

  <input 
    type="file" 
    class="fileDesainCloud"
    name="file_warna_${warnaIndex}" 
    id="fileDesain_${warnaIndex}" 
    data-warna-index="${warnaIndex}" 
    multiple 
    accept="image/*,.pdf,.ai,.psd"
    hidden
  >
  <button 
    type="button" 
    class="add-file-btn" 
    onclick="document.getElementById('fileDesain_${warnaIndex}').click()"
  >
  + Tambah File
  </button>

     <div class="file-list" id="fileList_${warnaIndex}"></div>
  <input type="hidden" name="linkDesain_${warnaIndex}" id="linkDesain_${warnaIndex}">
  <small>Format: JPG, PNG, PDF, AI, PSD (max 5MB/file)</small>
  </div>

  `;

    // Sembunyikan bagian warna, ukuran, desain saat awal
    setTimeout(() => updateWarnaOptions(warnaIndex), 0);

  container.appendChild(section);
  updateTotal();
}
  
    // Hapus Warna
   function hapusWarna(id) {
  if (confirm('Yakin ingin menghapus warna ini?')) {
    const section = document.getElementById(id);
    if (!section) return;

    section.classList.add('slide-out-up');

    // Tunggu animasi selesai sebelum benar-benar dihapus dari DOM
    setTimeout(() => {
      section.remove();
      updateTotal();
    }, 250); // sama dengan durasi animasi fadeOutSection
  }
}

    // Update Total Pesanan
    function updateTotal() {
  const sections = document.querySelectorAll('.warna-section');
  let totalPcs = 0;
  let detailPesanan = '';

  sections.forEach((section, idx) => {
    const jenisSelect = section.querySelector(`select[name="jenisProduk_${idx + 1}"]`);
    const jenisProduk = jenisSelect?.value || "kaos";

    const warnaSelect = section.querySelector(`select[name="warna${idx + 1}"]`);
    const warna = warnaSelect?.value || "";

    const dewasaInputs = section.querySelectorAll('input[name^="dewasa_"]');
    const anakInputs = section.querySelectorAll('input[name^="anak_"]');

    let totalWarna = 0;
    let detailDewasa = [];
    let detailAnak = [];

    dewasaInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const size = input.name.split('_')[2];
        totalWarna += qty;
        detailDewasa.push(`${size} ${qty}`);
      }
    });

    anakInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const size = input.name.split('_')[2];
        totalWarna += qty;
        detailAnak.push(`${size} ${qty}`);
      }
    });

    if (warna && totalWarna > 0) {
      totalPcs += totalWarna;
      detailPesanan += `${idx + 1}. (${jenisProduk}) ${warna}: ${totalWarna} pcs\n`;

      if (detailDewasa.length > 0) {
        detailPesanan += `   Dewasa: ${detailDewasa.join(', ')}\n`;
      }

      if (detailAnak.length > 0) {
        detailPesanan += `   Anak-anak: ${detailAnak.join(', ')}\n`;
      }

      detailPesanan += '\n';
    }
  });

  document.getElementById('totalDisplay').innerHTML = `
    <strong>Total Pesanan: ${totalPcs} pcs</strong>
    <pre style="margin-top:10px">${detailPesanan}</pre>
  `;

  hitungHargaTotal(); // hitung ulang
}

// ini untuk pilihan kaos, dress, lengan panjang
function updateWarnaOptions(warnaIndex) {
  const section = document.getElementById(`warna-${warnaIndex}`);
  const jenisSelect = section.querySelector(`select[name="jenisProduk_${warnaIndex}"]`);
  const warnaSelect = section.querySelector(`select[name="warna${warnaIndex}"]`);
  const jenis = jenisSelect?.value;

  const normalTable = section.querySelector(".ukuran-normal");
  const dressTable = section.querySelector(".ukuran-dress");

  // Reset nilai semua input sebelum tampilkan yang sesuai
  normalTable.querySelectorAll("input").forEach(input => input.value = "0");
  dressTable.querySelectorAll("input").forEach(input => input.value = "0");

  const inputsLain = section.querySelectorAll(
    'select[name^="warna"], .desain-section, .file-upload-container'
  );

  // SEMBUNYIKAN SEMUA DULU
  normalTable.style.display = "none";
  dressTable.style.display = "none";
  inputsLain.forEach(el => el.style.display = 'none');

  // MATIKAN validasi dan akses warna
  warnaSelect.style.display = 'none';
  warnaSelect.disabled = true;
  warnaSelect.required = false;

  // Jika belum pilih jenis produk, stop
  if (!jenis) return;

  // ✅ AKTIFKAN bagian yang sesuai
  if (jenis === "dress") {
    dressTable.style.display = "";
  } else {
    normalTable.style.display = "";
  }

  inputsLain.forEach(el => el.style.display = '');

  // AKTIFKAN select warna + validasi
  warnaSelect.style.display = '';
  warnaSelect.disabled = false;
  warnaSelect.required = true;

  const warnaListJenis = warnaPerJenisProduk?.[jenis] || warnaList;
  const selected = warnaSelect?.value;
  warnaSelect.innerHTML = '<option value="">-- Pilih Warna --</option>' +
    warnaListJenis.map(w => `<option value="${w}">${w}</option>`).join('');
  if (warnaListJenis.includes(selected)) warnaSelect.value = selected;

  updateTotal();
}
  
function generateHargaFullFormat() {
  const sections = document.querySelectorAll('.warna-section');
  let grandTotal = 0;
  let totalQtyKeseluruhan = 0;
  let tambahanDetail = { "2XL": 0, "3XL": 0 };
  let output = "";

  sections.forEach((section, idx) => {
    const warna = section.querySelector('select').value;
    const jenisSelect = section.querySelector(`select[name="jenisProduk_${idx + 1}"]`);
    const jenisProduk = jenisSelect?.value || "kaos";

    const dewasaInputs = section.querySelectorAll('input[name^="dewasa_"]');
    const anakInputs = section.querySelectorAll('input[name^="anak_"]');

    let dewasaDetail = [];
    let anakDetail = [];
    let qtyPerSection = 0;

    dewasaInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const size = input.name.split('_')[2];
        dewasaDetail.push(`${size} (${qty})`);
        totalQtyKeseluruhan += qty;
        qtyPerSection += qty;
        if (tambahanUkuran[size]) tambahanDetail[size] += qty;
      }
    });

    anakInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const size = input.name.split('_')[2];
        anakDetail.push(`${size} (${qty})`);
        totalQtyKeseluruhan += qty;
        qtyPerSection += qty;
      }
    });

    if (warna && (dewasaDetail.length || anakDetail.length)) {
      output += `${warna}\n`;
      if (dewasaDetail.length) output += `Dewasa: ${dewasaDetail.join(', ')}\n`;
      if (anakDetail.length) output += `Anak-anak: ${anakDetail.join(', ')}\n`;
      output += `\n`; // Spasi antar warna
    }
  });

  // Total harga & tambahan (di luar loop)
  const jenisProduk = "kaos"; // Default jenis (atau ambil global jika ingin)
  const hargaTiers = hargaPerJenisProduk[jenisProduk] || hargaPerJenisProduk["kaos"];
  const hargaDasar = hargaTiers.find(h => totalQtyKeseluruhan >= h.min)?.harga || 0;
  const tambahanPerPcs = tambahanJenisProduk[jenisProduk] || 0;
  const harga = hargaDasar + tambahanPerPcs;
  const subTotal = harga * totalQtyKeseluruhan;

  let totalTambahan = 0;
  for (let [ukuran, qty] of Object.entries(tambahanDetail)) {
    if (qty > 0) {
      const biaya = tambahanUkuran[ukuran] * qty;
      totalTambahan += biaya;
      output += `Tambahan ${ukuran}: ${formatRupiah(tambahanUkuran[ukuran])} × ${qty} = ${formatRupiah(biaya)}\n`;
    }
  }

  output += `Total Harga: ${formatRupiah(harga)} × ${totalQtyKeseluruhan} = ${formatRupiah(subTotal)}\n`;
  output += `Total Sub: ${formatRupiah(subTotal + totalTambahan)}\n`;

  return output.trim();
}

    // ========== PENANGANAN PENGIRIMAN FORM YANG DIPERBAIKI ==========
    document.getElementById('formPemesanan').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validasi nomor WhatsApp
      const waNumber = e.target.telepon.value;
      if (!/^\+?[0-9\s]{8,15}$/.test(waNumber)) {
        alert('Nomor WhatsApp harus 8-15 digit angka (boleh pakai + atau spasi)!');
      return;
      }

      // Validasi minimal 1 item dipesan
      const totalPcs = document.getElementById('totalDisplay').textContent.match(/\d+/)[0] || 0;
      if (totalPcs == 0) {
        alert('Anda belum memilih jumlah pesanan!');
        return;
      }

      // Tampilkan status loading
      document.getElementById('loadingMessage').style.display = 'block';
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      // upload ke Cloudinary
      for (let warnaIndex in fileListMap) {
  const files = fileListMap[warnaIndex];
  const urls = [];

  for (let file of files) {
    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", uploadPreset);
    formDataCloud.append("folder", "clovertees_uploads");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formDataCloud
      });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    } catch (err) {
      alert("❌ Gagal upload file ke Cloudinary!");
      console.error(err);
      return;
    }
  }

  const inputHidden = document.getElementById(`linkDesain_${warnaIndex}`);
  if (inputHidden) {
    inputHidden.value = urls.join(", ");
  }
}

      try {
        // Siapkan data form
        const formData = new FormData(e.target);
        formData.append('timestamp', new Date().toISOString());
        formData.append('totalQty', totalPcs);
        formData.append('detailPesanan', generateDetailPesanan());
        formData.append('totalHarga', hargaTotalSemua);
        
        const tempDiv = document.createElement('div');
          tempDiv.innerHTML = rincianHargaLengkapHTML;
        const rincianHargaTextOnly = tempDiv.textContent.trim();

        formData.append('hargaFormatted', rincianHargaTextOnly);

        const fileSections = document.querySelectorAll('.file-upload-container');

        fileSections.forEach((section) => {
          const input = section.querySelector('input[type="file"]');
          if (!input || !input.files) return;

          const files = input.files;
          const nameAttr = input.getAttribute("name");

          for (let j = 0; j < files.length; j++) {
            formData.append(nameAttr, files[j], files[j].name);
          }
        });

        // Ganti dengan URL Google Apps Script Anda yang sebenarnya
        const scriptURL = "https://script.google.com/macros/s/AKfycby2666N1oqPfBzoMcK8CD21FLInLOAg9h1f0calrT91hhcsAelJnGMPbjiQ5-6eBkrV/exec"
        
        for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
        }

        const response = await fetch(scriptURL, {
          method: 'POST',
          body: formData,
          redirect: 'follow'
        });

        if (!response.ok) {
          throw new Error(`Error HTTP! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Full response:", result); 
        
        if (result.status === "success") {
          showSuccessModal(`Nomor Pesanan Anda #${result.nomorPesanan} ! Kami akan menghubungi Anda via WhatsApp.`);
          e.target.reset();
          document.getElementById('warnaContainer').innerHTML = '';
          warnaIndex = 0;
          tambahWarna();
        } else {
          throw new Error(result.message || "Error tidak diketahui dari server");
        }
      } catch (error) {
        console.error('Error pengiriman:', error);
        alert(`❌ Gagal mengirim pesanan: ${error.message}`);
      } finally {
        document.getElementById('loadingMessage').style.display = 'none';
        submitBtn.disabled = false;
      }
    });

    // Generator detail yang diperbaiki
    function generateDetailPesanan() {
      const sections = document.querySelectorAll('.warna-section');
      let output = "";
      
      sections.forEach((section, idx) => {
        const warna = section.querySelector('select').value;
        const inputs = section.querySelectorAll('input[type="number"]');
        
        let dewasa = [], anak = [];
        
        inputs.forEach(input => {
          const qty = parseInt(input.value) || 0;
          if (qty > 0) {
            const size = input.name.split('_')[2];
            if (input.name.includes('dewasa')) {
              dewasa.push(`${size} (${qty})`);
            } else {
              anak.push(`${size} (${qty})`);
            }
          }
        });
        
        if (warna && (dewasa.length > 0 || anak.length > 0)) {
          output += `${idx + 1}. ${warna}:\n`;
          if (dewasa.length) output += `   Dewasa: ${dewasa.join(', ')}\n`;
          if (anak.length) output += `   Anak: ${anak.join(', ')}\n\n`;
        }
      });
      
      return output.trim();
    }

    function setupFileUpload(sectionId) {
  const section = document.getElementById(sectionId);
  const fileInput = section.querySelector('input[type="file"]');
  const fileList = section.querySelector('.file-list');
  const maxFiles = 5; // Batas maksimal file

  fileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    
    // Cek jumlah file
    if (fileList.children.length + files.length > maxFiles) {
      alert(`Maksimal ${maxFiles} file per warna`);
      return;
    }

    // Tambahkan file ke daftar
    Array.from(files).forEach(file => {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (max 5MB)`);
        return;
      }

      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.dataset.fileName = file.name;
      fileItem.innerHTML = `
        <span>${file.name} (${(file.size/1024/1024).toFixed(2)}MB)</span>
        <button type="button" class="delete-file-btn">✕</button>
      `;
      fileList.appendChild(fileItem);
    });

    // Reset input untuk mengizinkan upload file yang sama lagi
    fileInput.value = '';
  });

  // Handle klik tombol hapus file
  fileList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-file-btn')) {
      e.target.closest('.file-item').remove();
    }
  });
}

function renderFileList(warnaIndex) {
  const listContainer = document.querySelector(`#warna-${warnaIndex} .file-list`);
  listContainer.innerHTML = "";

  fileListMap[warnaIndex].forEach((file, idx) => {
    const div = document.createElement("div");
    div.className = "file-item";
    div.innerHTML = `
      ${file.name}
      <button type="button" onclick="removeFile(${warnaIndex}, ${idx})" style="margin-left: 10px;">❌</button>
    `;
    listContainer.appendChild(div);
  });
}

function removeFile(warnaIndex, fileIndex) {
  fileListMap[warnaIndex].splice(fileIndex, 1);
  renderFileList(warnaIndex);
}

// ==========================
// Upload Cloudinary per warna (dinamis)
// ==========================
const cloudName = "ddlisdhml"; // GANTI dengan Cloudinary kamu
const uploadPreset = "clovr_unsigned"; // GANTI dengan preset kamu

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("fileDesainCloud")) return;

  const input = e.target;
  const warnaIndex = input.dataset.warnaIndex;
  const files = Array.from(input.files);

  if (!fileListMap[warnaIndex]) {
    fileListMap[warnaIndex] = [];
  }

  fileListMap[warnaIndex].push(...files);
  renderFileList(warnaIndex);
});

function renderFileList(warnaIndex) {
  const listContainer = document.getElementById(`fileList_${warnaIndex}`);
  if (!listContainer) return;
  listContainer.innerHTML = "";

  fileListMap[warnaIndex]?.forEach((file, idx) => {
    const div = document.createElement("div");
    div.className = "file-item";
    div.innerHTML = `
      <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)</span>
      <button type="button" onclick="removeFile(${warnaIndex}, ${idx})">❌</button>
    `;
    listContainer.appendChild(div);
  });
}

function removeFile(warnaIndex, fileIndex) {
  fileListMap[warnaIndex].splice(fileIndex, 1);
  renderFileList(warnaIndex);
}

// Fungsi modal sukses
function showSuccessModal(nomorPesanan) {
  document.getElementById("successText").innerHTML = `<strong>${nomorPesanan}</strong>`;
  document.getElementById("successModal").style.display = "flex";
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "none";

  // Blur fokus dari elemen aktif agar browser tidak trigger validasi HTML5
  if (document.activeElement) {
    document.activeElement.blur();
  }
}

// INI BLOK FIX YANG BENAR UNTUK MENGAKTIFKAN TOMBOL OK MODAL
window.addEventListener("DOMContentLoaded", function () {
  tambahWarna(); // warna pertama otomatis saat halaman dibuka

  const closeBtn = document.getElementById("btnCloseSuccess");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeSuccessModal);
  }

  // Kamu bisa tambahkan event lain di sini jika perlu
});
