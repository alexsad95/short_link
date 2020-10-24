/**
 * Делает запрос на данные.
 * Добавляет в таблицу полученные данные.
 * Если ошибка выводит алерт
 */

const addSubmit = document.getElementById("addSubmit");
const subpart = document.getElementById("subpart");
const from = document.getElementById("from");

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return await response.json();
}

addSubmit.addEventListener("click", (_) => {
  postData("/short/add_url/", {
    subpart: subpart.value,
    from: from.value,
  }).then((data) => {
    if (data.error) {
      $(".alert_block").text(data.error).show().delay(2000).fadeOut("slow");
    } else if (data.link) {
      const currentTable = $("#dtBasicExample tbody tr.odd");
      if (currentTable.length === 1) {
        currentTable.remove();
      }
      const markup = `<tr>
        <td>${data.link.from}</td>
        <td>${data.link.to}</td>
        <td>${new Date(data.link.date).toGMTString()}</td>
        </tr>`;
      const tableBody = $("table tbody");
      tableBody.append(markup);
    }
  });
});
