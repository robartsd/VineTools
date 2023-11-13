(filepath as text) as table =>
let
    Source = Json.Document(File.Contents(filepath)),
    #"Converted to Table" = Record.ToTable(Source),
    #"Filtered Rows" = Table.SelectRows(#"Converted to Table", each (not Text.StartsWith([Name], "#")
)),
    #"Renamed Columns" = Table.RenameColumns(#"Filtered Rows",{{"Name", "ASIN"}}),
    #"Expanded Record" = Table.ExpandRecordColumn(#"Renamed Columns", "Value", {"itemLink", "itemTitle", "itemImage", "orderTimestamp", "reviewStatus", "reviewLink", "orderETV", "orderDetailsLink", "orderID", "shipmentInfo"}, {"itemLink", "itemTitle", "itemImage", "orderTimestamp", "reviewStatus", "reviewLink", "orderETV", "orderDetailsLink", "orderID", "shipmentInfo"}),
    #"Convert Order Timestamp" = Table.TransformColumns(#"Expanded Record",{{"orderTimestamp", (timestamp)=>DateTimeZone.ToLocal(DateTime.AddZone(#datetime(1970,1,1,0,0,0)+#duration(0,0,0,timestamp/1000),0)), type datetimezone}}),
    #"Convert ETV Column" = Table.TransformColumnTypes(Table.TransformColumns(#"Convert Order Timestamp", {{"orderETV", each Text.AfterDelimiter(_, "$"), type text}}),{{"orderETV", Currency.Type}})
in
    #"Convert ETV Column"
