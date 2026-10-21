import json, sys
sys.stdout.reconfigure(encoding='utf-8')

features = [
    # =========================================================================
    # 1. CÂY CÔNG NGHIỆP LÂU NĂM & HÀNG NĂM (Atlat GD, tr.19 & tr.20)
    # =========================================================================
    {
        "name": "Vùng cà phê Buôn Ma Thuột",
        "coords": [108.05, 12.67],
        "category": "industrial_crops",
        "crop_type": "Cà phê vối (Robusta)",
        "icon_emoji": "☕",
        "province": "Đắk Lắk",
        "region": "Tây Nguyên",
        "desc": "Thủ phủ cà phê Việt Nam trên cao nguyên đất đỏ bazan màu mỡ. Đắk Lắk dẫn đầu cả nước về diện tích và sản lượng cà phê xuất khẩu.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cà phê Di Linh - Bảo Lộc",
        "coords": [107.98, 11.55],
        "category": "industrial_crops",
        "crop_type": "Cà phê",
        "icon_emoji": "☕",
        "province": "Lâm Đồng",
        "region": "Tây Nguyên",
        "desc": "Vùng chuyên canh cà phê lớn thứ hai cả nước trên cao nguyên Di Linh lượn sóng.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cà phê Pleiku",
        "coords": [108.00, 13.98],
        "category": "industrial_crops",
        "crop_type": "Cà phê",
        "icon_emoji": "☕",
        "province": "Gia Lai",
        "region": "Tây Nguyên",
        "desc": "Vùng chuyên canh cà phê trọng điểm Bắc Tây Nguyên trên cao nguyên Pleiku.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cà phê Đắk Mil",
        "coords": [107.62, 12.45],
        "category": "industrial_crops",
        "crop_type": "Cà phê",
        "icon_emoji": "☕",
        "province": "Lâm Đồng",
        "region": "Tây Nguyên",
        "desc": "Vùng cà phê chất lượng cao trên cao nguyên Mơ Nông khí hậu cận xích đạo.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cà phê chè Mai Sơn",
        "coords": [103.95, 21.20],
        "category": "industrial_crops",
        "crop_type": "Cà phê chè (Arabica)",
        "icon_emoji": "☕",
        "province": "Sơn La",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng cà phê arabica nổi tiếng miền núi Tây Bắc với khí hậu cận nhiệt đới trên núi cao.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cà phê Khe Sanh - Hướng Hóa",
        "coords": [106.73, 16.68],
        "category": "industrial_crops",
        "crop_type": "Cà phê chè (Arabica)",
        "icon_emoji": "☕",
        "province": "Quảng Trị",
        "region": "Bắc Trung Bộ",
        "desc": "Vùng cà phê chè Khe Sanh trên đất bazan Hướng Hóa, thương hiệu cà phê đặc sản miền Trung.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Thủ phủ cao su Bình Phước",
        "coords": [106.88, 11.52],
        "category": "industrial_crops",
        "crop_type": "Cao su",
        "icon_emoji": "🌳",
        "province": "Thành phố Đồng Nai",
        "region": "Đông Nam Bộ",
        "desc": "Vùng chuyên canh cây cao su có diện tích và sản lượng lớn nhất cả nước, gắn với đất xám bạc màu và đất bazan lượn sóng.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Nông trường cao su Dầu Tiếng",
        "coords": [106.38, 11.32],
        "category": "industrial_crops",
        "crop_type": "Cao su",
        "icon_emoji": "🌳",
        "province": "Tây Ninh",
        "region": "Đông Nam Bộ",
        "desc": "Vùng cao su truyền thống quy mô đại nông trường lâu đời nhất vùng Đông Nam Bộ.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cao su Chư Sê - Đức Cơ",
        "coords": [108.02, 13.65],
        "category": "industrial_crops",
        "crop_type": "Cao su",
        "icon_emoji": "🌳",
        "province": "Gia Lai",
        "region": "Tây Nguyên",
        "desc": "Vùng cao su đại ngàn trọng điểm Tây Nguyên phát triển mạnh từ thập niên 1980.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng cao su Đức Linh",
        "coords": [107.55, 11.15],
        "category": "industrial_crops",
        "crop_type": "Cao su",
        "icon_emoji": "🌳",
        "province": "Lâm Đồng",
        "region": "Đông Nam Bộ",
        "desc": "Vùng cao su liên kết giữa Đông Nam Bộ và Duyên hải Nam Trung Bộ.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng chè Tân Cương",
        "coords": [105.80, 21.55],
        "category": "industrial_crops",
        "crop_type": "Chè búp",
        "icon_emoji": "🍵",
        "province": "Thái Nguyên",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "'Đệ nhất danh trà' Thái Nguyên. Tỉnh Thái Nguyên dẫn đầu cả nước về diện tích và sản lượng chè búp.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng chè Thanh Ba - Cẩm Khê",
        "coords": [105.20, 21.42],
        "category": "industrial_crops",
        "crop_type": "Chè búp",
        "icon_emoji": "🍵",
        "province": "Phú Thọ",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng chè đồi trung du truyền thống của đất Tổ Phú Thọ, diện tích chè lớn thứ 3 cả nước.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng chè cao nguyên Mộc Châu",
        "coords": [104.65, 20.85],
        "category": "industrial_crops",
        "crop_type": "Chè Shan tuyết & Ô long",
        "icon_emoji": "🍵",
        "province": "Sơn La",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng chè shan tuyết và chè ô long trên cao nguyên đá vôi Mộc Châu độ cao trên 1.000m.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng chè Bảo Lộc",
        "coords": [107.80, 11.54],
        "category": "industrial_crops",
        "crop_type": "Chè",
        "icon_emoji": "🍵",
        "province": "Lâm Đồng",
        "region": "Tây Nguyên",
        "desc": "Thủ phủ chè phía Nam, vùng chuyên canh chè lớn nhất miền Trung và Tây Nguyên.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng hồ tiêu Cư Kuin",
        "coords": [108.15, 12.55],
        "category": "industrial_crops",
        "crop_type": "Hồ tiêu",
        "icon_emoji": "🌶️",
        "province": "Đắk Lắk",
        "region": "Tây Nguyên",
        "desc": "Vùng chuyên canh hồ tiêu xuất khẩu trọng điểm Tây Nguyên trên đất đỏ bazan.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Hồ tiêu đảo Phú Quốc",
        "coords": [104.00, 10.25],
        "category": "industrial_crops",
        "crop_type": "Hồ tiêu",
        "icon_emoji": "🌶️",
        "province": "An Giang",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Đặc sản tiêu Phú Quốc cay nồng nổi tiếng, phát triển trên đất đồi đảo ngọc.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Thủ phủ điều Bù Đăng - Đồng Phú",
        "coords": [106.90, 11.60],
        "category": "industrial_crops",
        "crop_type": "Cây điều",
        "icon_emoji": "🥜",
        "province": "Thành phố Đồng Nai",
        "region": "Đông Nam Bộ",
        "desc": "Vùng trồng điều lớn nhất Việt Nam, nguyên liệu cho ngành chế biến hạt điều xuất khẩu số 1 thế giới.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng mía đường Lam Sơn",
        "coords": [105.40, 19.90],
        "category": "industrial_crops",
        "crop_type": "Mía đường",
        "icon_emoji": "🎋",
        "province": "Thanh Hoá",
        "region": "Bắc Trung Bộ",
        "desc": "Vùng nguyên liệu mía đường lớn nhất miền Bắc trên vùng đồi gò Thanh Hoá.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng mía đường Phụng Hiệp",
        "coords": [105.82, 9.80],
        "category": "industrial_crops",
        "crop_type": "Mía đường",
        "icon_emoji": "🎋",
        "province": "Thành phố Cần Thơ",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng mía ĐBSCL ven mạng lưới kênh rạch trù phú tây sông Hậu.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng lạc Diễn Châu - Nghi Lộc",
        "coords": [105.60, 18.90],
        "category": "industrial_crops",
        "crop_type": "Lạc (Đậu phộng)",
        "icon_emoji": "🥜",
        "province": "Nghệ An",
        "region": "Bắc Trung Bộ",
        "desc": "Vùng trồng lạc lớn nhất cả nước trên đất cát pha ven biển Bắc Trung Bộ.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Vùng thuốc lá Lạng Sơn",
        "coords": [106.75, 21.85],
        "category": "industrial_crops",
        "crop_type": "Cây thuốc lá",
        "icon_emoji": "🍂",
        "province": "Lạng Sơn",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng chuyên canh thuốc lá vàng sấy lớn nhất miền núi Đông Bắc.",
        "source": "Atlat GD, tr.19 & tr.20"
    },
    {
        "name": "Xứ dừa Giồng Trôm - Châu Thành",
        "coords": [106.40, 10.20],
        "category": "industrial_crops",
        "crop_type": "Cây dừa",
        "icon_emoji": "🥥",
        "province": "Đồng Tháp",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Thủ phủ dừa Bến Tre lớn nhất Việt Nam, chiếm trên 40% diện tích dừa cả nước.",
        "source": "Atlat GD, tr.19 & tr.20"
    },

    # =========================================================================
    # 2. CÂY LƯƠNG THỰC & CÂY ĂN QUẢ (Atlat GD, tr.19)
    # =========================================================================
    {
        "name": "Vùng thâm canh lúa Đồng bằng sông Hồng",
        "coords": [106.30, 20.50],
        "category": "food_crops",
        "crop_type": "Lúa gạo",
        "icon_emoji": "🌾",
        "province": "Hưng Yên",
        "region": "Đồng bằng sông Hồng",
        "desc": "Vùng có trình độ thâm canh lúa cao nhất nước, năng suất lúa bình quân dẫn đầu toàn quốc.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Vựa lúa Tứ giác Long Xuyên",
        "coords": [105.15, 10.35],
        "category": "food_crops",
        "crop_type": "Lúa gạo",
        "icon_emoji": "🌾",
        "province": "An Giang",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Trọng điểm sản xuất lúa và nông sản hàng hóa xuất khẩu lớn nhất ĐBSCL.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Vựa lúa Đồng Tháp Mười",
        "coords": [105.75, 10.60],
        "category": "food_crops",
        "crop_type": "Lúa gạo",
        "icon_emoji": "🌾",
        "province": "Đồng Tháp",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng thâm canh lúa năng suất cao sau khi được thau chua rửa mặn thành công.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Cánh đồng lúa Mường Thanh",
        "coords": [103.02, 21.38],
        "category": "food_crops",
        "crop_type": "Lúa gạo",
        "icon_emoji": "🌾",
        "province": "Điện Biên",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Cánh đồng lúa thung lũng lòng chảo lớn nhất miền Tây Bắc ('nhất Thanh, nhì Lò, tam Than, tứ Tấc').",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Cánh đồng lúa Than Uyên",
        "coords": [103.70, 21.95],
        "category": "food_crops",
        "crop_type": "Lúa gạo",
        "icon_emoji": "🌾",
        "province": "Lai Châu",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Cánh đồng lúa phì nhiêu lớn thứ ba vùng Tây Bắc đón nguồn nước sông Nậm Mu.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Vùng ngô cao nguyên đá Đồng Văn",
        "coords": [105.00, 22.80],
        "category": "food_crops",
        "crop_type": "Cây ngô",
        "icon_emoji": "🌽",
        "province": "Tuyên Quang",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Cây lương thực hoa màu thích ứng thổ nhưỡng hốc đá vôi vùng cao cực Bắc.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Vùng ngô lai Sơn La",
        "coords": [104.05, 21.15],
        "category": "food_crops",
        "crop_type": "Cây ngô",
        "icon_emoji": "🌽",
        "province": "Sơn La",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng sản xuất ngô thương phẩm quy mô lớn cung cấp nguyên liệu chế biến thức ăn chăn nuôi.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Vải thiều Lục Ngạn",
        "coords": [106.60, 21.35],
        "category": "food_crops",
        "crop_type": "Vải thiều",
        "icon_emoji": "🍓",
        "province": "Bắc Ninh",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Thương hiệu vải thiều xuất khẩu lớn nhất Việt Nam trên đồi đất dốc Bắc Giang.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Nhãn lồng Hưng Yên",
        "coords": [106.05, 20.65],
        "category": "food_crops",
        "crop_type": "Nhãn lồng",
        "icon_emoji": "🍇",
        "province": "Hưng Yên",
        "region": "Đồng bằng sông Hồng",
        "desc": "Đặc sản trái cây nhiệt đới nổi tiếng đất phù sa châu thổ sông Hồng.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Xoài cát Hòa Lộc",
        "coords": [105.90, 10.35],
        "category": "food_crops",
        "crop_type": "Xoài cát",
        "icon_emoji": "🥭",
        "province": "Đồng Tháp",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng chuyên canh xoài xuất khẩu chất lượng cao ven sông Tiền.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Thanh long Hàm Thuận",
        "coords": [108.05, 11.00],
        "category": "food_crops",
        "crop_type": "Thanh long",
        "icon_emoji": "🐉",
        "province": "Lâm Đồng",
        "region": "Duyên hải Nam Trung Bộ",
        "desc": "Vùng chuyên canh thanh long xuất khẩu lớn nhất nước trên đất cát pha ven biển khô hạn.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Sầu riêng Cái Lậy",
        "coords": [106.12, 10.40],
        "category": "food_crops",
        "crop_type": "Sầu riêng",
        "icon_emoji": "🍈",
        "province": "Đồng Tháp",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng cây ăn trái nhiệt đới giá trị kinh tế cao trên đất phù sa ngọt bồi đắp hàng năm.",
        "source": "Atlat GD, tr.19"
    },

    # =========================================================================
    # 3. CHĂN NUÔI GIA SÚC & GIA CẦM (Atlat GD, tr.19)
    # =========================================================================
    {
        "name": "Đàn trâu Đông Bắc (Tuyên Quang - Hà Giang)",
        "coords": [105.20, 22.10],
        "category": "livestock",
        "crop_type": "Đàn trâu",
        "icon_emoji": "🐃",
        "province": "Tuyên Quang",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng có số lượng trâu lớn nhất nước (chiếm trên 50% đàn trâu cả nước) do trâu ưa ẩm, chịu rét giỏi và thích nghi sườn dốc.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn trâu Tây Bắc (Điện Biên - Sơn La)",
        "coords": [103.50, 21.50],
        "category": "livestock",
        "crop_type": "Đàn trâu",
        "icon_emoji": "🐃",
        "province": "Sơn La",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Vùng chăn thả gia súc lớn vùng cao, cung cấp sức kéo và thịt.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn trâu Bắc Trung Bộ (Nghệ An - Thanh Hoá)",
        "coords": [105.50, 19.30],
        "category": "livestock",
        "crop_type": "Đàn trâu",
        "icon_emoji": "🐃",
        "province": "Thanh Hoá",
        "region": "Bắc Trung Bộ",
        "desc": "Vùng tập trung đàn trâu lớn thứ hai cả nước trên các vùng đồi trước núi.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn bò thịt Nghệ An - Hà Tĩnh",
        "coords": [105.45, 18.70],
        "category": "livestock",
        "crop_type": "Đàn bò thịt",
        "icon_emoji": "🐂",
        "province": "Nghệ An",
        "region": "Bắc Trung Bộ",
        "desc": "Tỉnh Nghệ An dẫn đầu cả nước về số lượng đàn bò thịt nhờ diện tích đồng cỏ đồi gò rộng lớn.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn bò thịt Duyên hải Nam Trung Bộ",
        "coords": [108.80, 14.30],
        "category": "livestock",
        "crop_type": "Đàn bò thịt",
        "icon_emoji": "🐂",
        "province": "Gia Lai",
        "region": "Duyên hải Nam Trung Bộ",
        "desc": "Vùng chăn nuôi bò thịt truyền thống có quy mô lớn dựa trên đồng cỏ khô hạn ven biển.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn bò thịt cao nguyên Gia Lai - Đắk Lắk",
        "coords": [108.20, 13.50],
        "category": "livestock",
        "crop_type": "Đàn bò thịt",
        "icon_emoji": "🐂",
        "province": "Đắk Lắk",
        "region": "Tây Nguyên",
        "desc": "Chăn nuôi bò thịt quy mô trang trại trên các đồng cỏ cao nguyên bazan rộng lớn.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn bò sữa Mộc Châu",
        "coords": [104.70, 20.83],
        "category": "livestock",
        "crop_type": "Bò sữa",
        "icon_emoji": "🐄",
        "province": "Sơn La",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Trung tâm chăn nuôi bò sữa ôn đới lâu đời và hiện đại nhất miền Bắc trên cao nguyên Mộc Châu.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn bò sữa Ba Vì",
        "coords": [105.40, 21.10],
        "category": "livestock",
        "crop_type": "Bò sữa",
        "icon_emoji": "🐄",
        "province": "Thành phố Hà Nội",
        "region": "Đồng bằng sông Hồng",
        "desc": "Vành đai chăn nuôi bò sữa thâm canh ven đô cung cấp sữa tươi cho Thủ đô và miền Bắc.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn bò sữa công nghệ cao Đức Trọng",
        "coords": [108.40, 11.75],
        "category": "livestock",
        "crop_type": "Bò sữa",
        "icon_emoji": "🐄",
        "province": "Lâm Đồng",
        "region": "Tây Nguyên",
        "desc": "Trung tâm bò sữa công nghệ cao lớn nhất Tây Nguyên với các trang trại chuẩn quốc tế.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn lợn Đồng bằng sông Hồng",
        "coords": [105.95, 20.90],
        "category": "livestock",
        "crop_type": "Đàn lợn",
        "icon_emoji": "🐖",
        "province": "Hưng Yên",
        "region": "Đồng bằng sông Hồng",
        "desc": "Vùng chăn nuôi lợn thâm canh lớn nhất cả nước dựa trên nguồn hoa màu dồi dào và thị trường tiêu thụ lớn.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Thủ phủ chăn nuôi lợn Thành phố Đồng Nai",
        "coords": [107.10, 11.05],
        "category": "livestock",
        "crop_type": "Đàn lợn công nghiệp",
        "icon_emoji": "🐖",
        "province": "Thành phố Đồng Nai",
        "region": "Đông Nam Bộ",
        "desc": "Địa phương dẫn đầu cả nước về chăn nuôi lợn công nghiệp và trang trại khép kín quy mô lớn.",
        "source": "Atlat GD, tr.19"
    },
    {
        "name": "Đàn gia cầm Đồng bằng sông Cửu Long",
        "coords": [105.70, 10.20],
        "category": "livestock",
        "crop_type": "Gia cầm (Vịt đàn)",
        "icon_emoji": "🦆",
        "province": "Đồng Tháp",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng nuôi vịt đàn lớn nhất cả nước gắn liền với mạng lưới sông ngòi và mùa lũ đồng bằng.",
        "source": "Atlat GD, tr.19"
    },

    # =========================================================================
    # 4. THỦY SẢN & NGƯ TRƯỜNG TRỌNG ĐIỂM (Atlat GD, tr.21)
    # =========================================================================
    {
        "name": "Ngư trường Hải Phòng - Quảng Ninh",
        "coords": [107.80, 20.50],
        "category": "fishery",
        "crop_type": "Ngư trường trọng điểm",
        "icon_emoji": "🐟",
        "province": "Thành phố Hải Phòng",
        "region": "Đồng bằng sông Hồng",
        "desc": "Ngư trường trọng điểm vịnh Bắc Bộ với trữ lượng hải sản cá nổi, cá đáy và đảo Bạch Long Vĩ tiền tiêu.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Ngư trường Ninh Thuận - Bình Thuận - Bà Rịa - Vũng Tàu",
        "coords": [109.20, 10.50],
        "category": "fishery",
        "crop_type": "Ngư trường trọng điểm",
        "icon_emoji": "🐟",
        "province": "Lâm Đồng",
        "region": "Đông Nam Bộ",
        "desc": "Ngư trường có năng suất đánh bắt cao nhất cả nước, nguồn lợi cá nục, cá thu, cá trích, mực dồi dào.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Ngư trường Cà Mau - Kiên Giang",
        "coords": [104.20, 9.00],
        "category": "fishery",
        "crop_type": "Ngư trường trọng điểm",
        "icon_emoji": "🦐",
        "province": "Tỉnh Cà Mau",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Ngư trường vịnh Thái Lan vùng biển nông ấm, giàu nguồn lợi tôm, cua biển và cá đáy lớn nhất nước.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Ngư trường Quần đảo Hoàng Sa - Quần đảo Trường Sa",
        "coords": [113.50, 13.00],
        "category": "fishery",
        "crop_type": "Ngư trường xa bờ",
        "icon_emoji": "🇻🇳",
        "province": "Thành phố Đà Nẵng",
        "region": "Duyên hải Nam Trung Bộ",
        "desc": "Ngư trường biển xa bờ giàu tiềm năng khai thác cá ngừ đại dương, cá thu và khẳng định chủ quyền biển đảo thiêng liêng Tổ quốc.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Thủ phủ nuôi tôm Cà Mau (Năm Căn - Đầm Dơi)",
        "coords": [105.00, 8.75],
        "category": "fishery",
        "crop_type": "Nuôi tôm nước lợ",
        "icon_emoji": "🦐",
        "province": "Tỉnh Cà Mau",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Tỉnh dẫn đầu cả nước về diện tích và sản lượng tôm nuôi (tôm sú, tôm thẻ chân trắng) xuất khẩu toàn cầu.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Vùng nuôi tôm Bạc Liêu - Sóc Trăng",
        "coords": [105.65, 9.35],
        "category": "fishery",
        "crop_type": "Nuôi tôm công nghiệp",
        "icon_emoji": "🦐",
        "province": "Tỉnh Cà Mau",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng nuôi tôm thâm canh và siêu thâm canh công nghệ cao dẫn đầu ĐBSCL.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Vùng nuôi tôm Bến Tre - Trà Vinh",
        "coords": [106.60, 9.90],
        "category": "fishery",
        "crop_type": "Nuôi tôm ven biển",
        "icon_emoji": "🦐",
        "province": "Tỉnh Vĩnh Long",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng nuôi trồng thủy sản nước lợ và mặn tại các bãi triều rừng ngập mặn ven biển.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Thủ phủ cá tra An Giang",
        "coords": [105.20, 10.65],
        "category": "fishery",
        "crop_type": "Nuôi cá tra, ba sa",
        "icon_emoji": "🐟",
        "province": "Tỉnh An Giang",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng nuôi cá tra, cá ba sa xuất khẩu số 1 thế giới ven sông Tiền và sông Hậu.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Vùng nuôi cá tra Đồng Tháp",
        "coords": [105.50, 10.70],
        "category": "fishery",
        "crop_type": "Nuôi cá tra",
        "icon_emoji": "🐟",
        "province": "Tỉnh Đồng Tháp",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Vùng nuôi cá ao công nghiệp và bè cá lớn nhất ĐBSCL dọc sông Tiền.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Cảng cá & Đánh bắt cá ngừ Quy Nhơn",
        "coords": [109.25, 13.78],
        "category": "fishery",
        "crop_type": "Khai thác cá xa bờ",
        "icon_emoji": "🐟",
        "province": "Tỉnh Gia Lai",
        "region": "Duyên hải Nam Trung Bộ",
        "desc": "Đội tàu đánh bắt xa bờ câu cá ngừ đại dương lớn nhất duyên hải miền Trung.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Cảng cá Phan Thiết",
        "coords": [108.10, 10.92],
        "category": "fishery",
        "crop_type": "Khai thác cá biển",
        "icon_emoji": "🐟",
        "province": "Tỉnh Lâm Đồng",
        "region": "Duyên hải Nam Trung Bộ",
        "desc": "Trung tâm chế biến nước mắm truyền thống và khai thác cá nổi lớn nhất Nam Trung Bộ.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Cảng cá Rạch Giá - Phú Quốc",
        "coords": [105.08, 10.02],
        "category": "fishery",
        "crop_type": "Khai thác hải sản",
        "icon_emoji": "🐟",
        "province": "Tỉnh An Giang",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Tỉnh dẫn đầu cả nước về sản lượng khai thác hải sản biển.",
        "source": "Atlat GD, tr.21"
    },

    # =========================================================================
    # 5. LÂM NGHIỆP & RỪNG (Atlat GD, tr.21)
    # =========================================================================
    {
        "name": "Rừng ngập mặn Mũi Cà Mau",
        "coords": [104.75, 8.62],
        "category": "forestry",
        "crop_type": "Rừng ngập mặn",
        "icon_emoji": "🌲",
        "province": "Tỉnh Cà Mau",
        "region": "Đồng bằng sông Cửu Long",
        "desc": "Khu dự trữ sinh quyển thế giới Mũi Cà Mau, diện tích rừng ngập mặn lớn nhất nước có vai trò chắn sóng và lấn biển.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Rừng ngập mặn Cần Giờ",
        "coords": [106.90, 10.45],
        "category": "forestry",
        "crop_type": "Rừng phòng hộ ngập mặn",
        "icon_emoji": "🌲",
        "province": "Thành phố Hồ Chí Minh",
        "region": "Đông Nam Bộ",
        "desc": "Khu dự trữ sinh quyển thế giới Cần Giờ - 'lá phổi xanh' bảo vệ cửa sông Sài Gòn - Đồng Nai.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Vùng lâm sản Tây Bắc",
        "coords": [103.70, 21.60],
        "category": "forestry",
        "crop_type": "Rừng phòng hộ đầu nguồn",
        "icon_emoji": "🌲",
        "province": "Tỉnh Sơn La",
        "region": "Trung du và miền núi Bắc Bộ",
        "desc": "Rừng phòng hộ đầu nguồn sông Đà và sông Mã có vai trò bảo vệ hồ chứa thủy điện Hòa Bình, Sơn La.",
        "source": "Atlat GD, tr.21"
    },
    {
        "name": "Vùng lâm nghiệp Tây Nguyên",
        "coords": [107.85, 14.50],
        "category": "forestry",
        "crop_type": "Rừng sản xuất & Gỗ",
        "icon_emoji": "🌲",
        "province": "Tỉnh Quảng Ngãi",
        "region": "Tây Nguyên",
        "desc": "Vùng có độ che phủ rừng cao nhất cả nước, giàu tiềm năng gỗ lớn, tre nứa và lâm sản quý.",
        "source": "Atlat GD, tr.21"
    }
]

geojson = {
    "type": "FeatureCollection",
    "name": "agriculture_fishery_full",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": f["coords"]
            },
            "properties": {
                "name": f["name"],
                "category": f["category"],
                "crop_type": f["crop_type"],
                "icon_emoji": f["icon_emoji"],
                "province": f["province"],
                "region": f["region"],
                "desc": f["desc"],
                "source": f["source"]
            }
        }
        for f in features
    ]
}

with open('public/data/agriculture_fishery.geojson', 'w', encoding='utf-8') as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"Generated {len(features)} comprehensive agricultural features in public/data/agriculture_fishery.geojson!")
