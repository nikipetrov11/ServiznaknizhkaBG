import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* ================= IMPORTANT FONT REGISTER ================= */
Font.register({
  family: "DejaVu",
  src: "/fonts/DejaVuSans.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "DejaVu", // 🔥 THIS FIXES CYRILLIC
  },

  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    fontFamily: "DejaVu",
  },

  row: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    padding: 5,
  },

  header: {
    flexDirection: "row",
    backgroundColor: "#111827",
    color: "white",
    padding: 5,
  },

  cell: {
    flex: 1,
  },

  total: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default function ServicePDF({ car, user }) {
  const total = (car.history || []).reduce(
    (a, b) => a + Number(b.price || 0),
    0
  );

  return (
    <Document>
      <Page style={styles.page}>

        <Text style={styles.title}>СЕРВИЗЕН ДОКЛАД</Text>

        <View>
          <Text>Собственик: {user.email}</Text>
          <Text>Автомобил: {car.name}</Text>
          <Text>Дата: {new Date().toLocaleDateString("bg-BG")}</Text>
        </View>

        {/* TABLE HEADER */}
        <View style={styles.header}>
          <Text style={styles.cell}>Сервиз</Text>
          <Text style={styles.cell}>Км</Text>
          <Text style={styles.cell}>Цена</Text>
          <Text style={styles.cell}>Дата</Text>
        </View>

        {/* TABLE BODY */}
        {(car.history || []).map((h, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.cell}>{h.work}</Text>
            <Text style={styles.cell}>{h.km}</Text>
            <Text style={styles.cell}>€{h.price}</Text>
            <Text style={styles.cell}>{h.date}</Text>
          </View>
        ))}

        <Text style={styles.total}>ОБЩО: €{total}</Text>

      </Page>
    </Document>
  );
}