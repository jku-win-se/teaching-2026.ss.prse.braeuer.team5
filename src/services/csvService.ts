/** Service-Objekt für CSV-Exporte. */
export const csvService = {

  /**
   * Exportiert tabellarische Daten als CSV-Datei und löst einen Browser-Download aus.
   * Verwendet UTF-8 mit BOM (`﻿`) für korrekte Darstellung in Microsoft Excel.
   * Spalten werden mit Semikolon getrennt (deutsches Excel-Format).
   * @param headers - Spaltenüberschriften (erste Zeile).
   * @param rows - Datenzeilen (jede Zeile ist ein Array von Werten).
   * @param filename - Dateiname ohne Endung (`.csv` wird automatisch angehängt).
   */
  exportToCSV(headers: string[], rows: (string | number)[][], filename: string): void {
    if (!rows || rows.length === 0) {
      alert("Keine Daten zum Exportieren vorhanden.");
      return;
    }

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob(["﻿" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${filename}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
};
